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
      stackName: indexdPods[pod.pod_name].StackName,
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
    return promise.then(() => {
      console.log(`Teardown ${pod.podName}`);
      return utils.tearDownByType(pod.podName, pod.stackName);
    });
  }, Promise.resolve());
}
