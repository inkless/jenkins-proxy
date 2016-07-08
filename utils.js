const fs = require('fs');
const request = require('request');
const AWS = require('aws-sdk');
const _ = require('lodash');
const config = require('./config');

const podsCachePath = config.LIST_POD_CACHE;
const slackUsers = require(config.SLACK_USER_CACHE);

const cloudformation = new AWS.CloudFormation({region: config.AWS_REGION});
const MINUTE_IN_MILLISECONDS = 60 * 1000;

exports.callJenkins = qs => {
  return new Promise((resolve, reject) => {
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
};

exports.getUser = getUser;

exports.getUserEmail = userId => {
  const user = getUser(userId);
  return user ? user.profile.email : "";
};

exports.getPods = () => {
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
};

function getUser(userId) {
  return slackUsers[userId];
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
