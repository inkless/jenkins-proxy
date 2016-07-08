require('dotenv').config();

const _ = require('lodash');
const utils = require('../utils');
const podModel = require('../model/pod_creation');

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

Promise.all([
  podModel.getAll(),
  utils.getPods(),
]).then(result => {
  const pods = getValidPods(result[0], getIndexdVersionOfAllPods(result[1]));
  delPods(getDelPods(pods));
});

function getIndexdVersionOfAllPods(pods) {
  return _.fromPairs(pods.map(pod => {
    return [pod.Parameters.PodName, {
      CreationTime: pod.CreationTime,
      Creator: pod.Parameters.Creator,
    }];
  }));
}

function getValidPods(podsToCheck, indexdPods) {
  return podsToCheck.filter(pod => {
    return indexdPods[pod.pod_name];
  }).map(pod => {
    return {
      podName: pod.pod_name,
      createdAt: indexdPods[pod.pod_name].CreationTime,
      persistDay: pod.persist_day,
    };
  });
}

function getDelPods(pods) {
  return pods.filter(pod => {
    return pod.persistDay !== 0 && Math.floor(
      (+new Date() - (+new Date(pod.createdAt))) / DAY_IN_MILLISECONDS
    ) >= pod.persistDay;
  });
}

function delPods(pods) {
  return pods.reduce((promise, pod) => {
    return promise.then(() => tearDown(pod.podName));
  }, Promise.resolve());
}

function tearDown(podName) {
  console.log(`Teardown ${podName}`);
  const qs = {
    job: process.env.TEAR_DOWN_JOB,
    token: process.env.TEAR_DOWN_TOKEN,
    pod_name: podName,
  };
  return podModel.remove(podName)
    .then(() => utils.callJenkins(qs));
}

