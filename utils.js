const request = require('request');
const AWS = require('aws-sdk');
const _ = require('lodash');

const slackUsers = require('./' + process.env.SLACK_USER_CACHE);
const jenkinsUrl = 'https://build.symphonycommerce.com/ci/buildByToken/buildWithParameters';
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
    cloudformation.describeStacks({}, (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(data.Stacks.filter(stack => {
        return _.find(stack.Parameters, { ParameterKey: 'EnvName', ParameterValue: 'dev' });
      }));
    });
  });
}

function cfParam2Obj(params) {
  return _.fromPairs(params.map(param => {
    return [param.ParameterKey, param.ParameterValue];
  }));
}

module.exports = {
  callJenkins,
  getUser,
  getUserEmail,
  getPods,
  cfParam2Obj,
};
