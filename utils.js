const request = require('request');
const slackUsers = require('./' + process.env.SLACK_USER_CACHE);

const jenkinsUrl = 'https://build.symphonycommerce.com/ci/buildByToken/buildWithParameters';

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

module.exports = {
  callJenkins,
  getUser,
};
