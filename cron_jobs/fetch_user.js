require('dotenv').config();

const request = require('request');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const apiUrl = 'https://slack.com/api/users.list';
const workDir = path.join(__dirname, '..');
const cacheFile = path.join(workDir, process.env.SLACK_USER_CACHE);
const cacheDir = path.dirname(cacheFile);

mkdirp.sync(cacheDir);

request.get({
  url: apiUrl,
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

  fs.writeFileSync(cacheFile, JSON.stringify(users));
});

