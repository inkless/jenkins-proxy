var request = require('request');
var Promise = require('promise');

var jenkinsUrl = 'https://build.symphonycommerce.com/ci/buildByToken/buildWithParameters';

function callJenkins(qs) {
  return new Promise(function (resolve, reject) {
    request.get({
      url: jenkinsUrl,
      qs: qs,
    }, function (err, httpResponse, body) {
      if (err) {
        reject(err);
      } else {
        resolve(body);
      }
    });
  });
}

module.exports = {
  callJenkins: callJenkins,
};
