module.exports = {
  SLACK_USER_CACHE: `${__dirname}/cache/slack-user.json`,
  LIST_POD_CACHE: `${__dirname}/cache/pods.json`,
  CACHE_TIME_IN_MINUTES: 5,
  AWS_REGION: 'us-east-1',
  JENKINS_URL: 'https://build.symphonycommerce.com/ci/buildByToken/buildWithParameters',
  DB_PATH: `${__dirname}/db/data.db`,
  SLACK_USER_LIST_API: 'https://slack.com/api/users.list',
};
