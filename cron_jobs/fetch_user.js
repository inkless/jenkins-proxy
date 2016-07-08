require('dotenv').config();

const request = require('request');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const config = require('../config');

request.get({
  url: config.SLACK_USER_LIST_API,
  qs: {
    token: process.env.SLACK_BOT_TOKEN,
  },
}, function(err, httpResponse, body) {
  if (err) {
    console.log( err);
    return;
  }

  const bodyObj = JSON.parse(body);
  const users = {};
  bodyObj.members.forEach(member => {
    users[member.id] = member;
  });

  fs.writeFileSync(config.SLACK_USER_CACHE, JSON.stringify(users));
});

