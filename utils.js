const fs = require('fs');
const request = require('request');
const AWS = require('aws-sdk');
const _ = require('lodash');

const cwd = __dirname + '/';
const podsCachePath = cwd + process.env.LIST_POD_CACHE;
const jenkinsUrl = 'https://build.symphonycommerce.com/ci/buildByToken/buildWithParameters';
const slackUsers = require(cwd + process.env.SLACK_USER_CACHE);

const cloudformation = new AWS.CloudFormation({region: 'us-east-1'});

function callJenkins(qs) {
  return new Promise((resolve, reject) => {
    request.get({
      url: jenkinsUrl,
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
    try {
      const stat = fs.statSync(podsCachePath);
      // minutes since last modified
      if ((+new Date() - (+new Date(stat.mtime))) / 1000 / 60 > 5) {
        _fetchFromCfAndWriteToCache()
          .then(resolve)
          .catch(reject);
      } else {
        console.log('get stacks from cache');
        resolve(require(podsCachePath));
      }
    } catch(e) {
      _fetchFromCfAndWriteToCache()
        .then(resolve)
        .catch(reject);
    }
  });
}

function cfParam2Obj(params) {
  return _.fromPairs(params.map(param => {
    return [param.ParameterKey, param.ParameterValue];
  }));
}

function _fetchFromCfAndWriteToCache() {
  return new Promise((resolve, reject) => {
    console.log('fetching stacks data from CloudFormation');
    cloudformation.describeStacks({}, (err, data) => {
      if (err) return reject(err);
      const stacks = data.Stacks.filter(stack => {
        return _.find(stack.Parameters, { ParameterKey: 'EnvName', ParameterValue: 'dev' });
      });
      fs.writeFileSync(podsCachePath, JSON.stringify(stacks));
      resolve(stacks);
    });
  });
}

module.exports = {
  callJenkins,
  getUser,
  getUserEmail,
  getPods,
  cfParam2Obj,
};
