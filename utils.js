const fs = require('fs');
const request = require('request');
const AWS = require('aws-sdk');
const _ = require('lodash');
const config = require('./config');
const podModel = require('./model/pod_creation');

const podsCachePath = config.LIST_POD_CACHE;
const slackUsers = require(config.SLACK_USER_CACHE);

const cloudformation = new AWS.CloudFormation({region: config.AWS_REGION});
const MINUTE_IN_MILLISECONDS = 60 * 1000;

module.exports = {
  callJenkins,
  getUser,
  getUserEmail,
  getPods,
  getPod,
  getPodType,
  tearDownByType,
};

function callJenkins(qs) {
  return new Promise((resolve, reject) => {
    console.log(`Calling jenkins: ${JSON.stringify(qs)}`);
    request.get({
      url: config.JENKINS_URL,
      qs,
    }, (err, httpResponse, body) => {
      if (err) {
        reject(err);
      } else {
        resolve(body);
      }
    });
  });
}

function getUser(userId) {
  return slackUsers[userId];
}

function getUserEmail(userId) {
  const user = getUser(userId);
  return user ? user.profile.email : "";
}

function getPods() {
  return new Promise((resolve, reject) => {
    let needToFetch = true;
    try {
      const stat = fs.statSync(podsCachePath);
      // minutes since last modified
      if ((+new Date() - (+new Date(stat.mtime))) / MINUTE_IN_MILLISECONDS <
        config.CACHE_TIME_IN_MINUTES) {
        needToFetch = false;
      }
    } catch(e) {}

    if (needToFetch) {
      fetchFromCfAndWriteToCache()
        .then(resolve)
        .catch(reject);
    } else {
      console.log('get stacks from cache');
      resolve(require(podsCachePath));
    }
  });
}

function getPod(podName) {
  return getPods()
    .then(pods => {
      return _.find(pods, {
        Parameters: {
          PodName: podName,
        },
      });
    });
}

function getPodType(stackName) {
  return /-pod/.test(stackName) ? 'new' : 'old';
}

function tearDownByType(podName, stackName) {
  const qs = {
    pod_name: podName,
  };
  if (getPodType(stackName) === 'old') {
    qs.job = process.env.TEAR_DOWN_JOB;
    qs.token = process.env.TEAR_DOWN_TOKEN;
  } else {
    qs.job = process.env.TEAR_DOWN_V2_JOB;
    qs.token = process.env.TEAR_DOWN_V2_TOKEN;
    qs.ansible_branch = 'chris/role/new_pods';
  }

  return callJenkins(qs)
    .then(() => podModel.remove(podName));
}

function fetchFromCfAndWriteToCache() {
  return new Promise((resolve, reject) => {
    console.log('fetching stacks data from CloudFormation');
    cloudformation.describeStacks({}, (err, data) => {
      if (err) return reject(err);
      const stacks = data.Stacks.map(stack => {
        stack.Parameters = cfParam2Obj(stack.Parameters);
        return stack;
      }).filter(stack => {
        return stack.Parameters.EnvName === 'dev';
      });
      fs.writeFileSync(podsCachePath, JSON.stringify(stacks));
      resolve(stacks);
    });
  });
}

function cfParam2Obj(params) {
  return _.fromPairs(params.map(param => {
    return [param.ParameterKey, param.ParameterValue];
  }));
}
