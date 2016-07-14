var authTokenMap = {
  '/create_pod': process.env.CREATE_POD_SLACK_AUTH,
  '/create_pod_v2': process.env.CREATE_POD_V2_SLACK_AUTH,
  '/integration_test': process.env.INTEGRATION_TEST_SLACK_AUTH,
  '/tear_down': process.env.TEAR_DOWN_SLACK_AUTH,
  '/list_pod': process.env.LIST_POD_SLACK_AUTH,
};

module.exports = function (req, res, next) {
  // log the request
  console.log(`Request: ${req.url}`);

  if (!req.body.token && req.path !== '/') {
    return res.status(403).send('no token specified');
  }

  if (!req.body.user_id) {
    return res.status(403).send('no user specified');
  }

  if (req.body.token && authTokenMap[req.path]) {
    if (authTokenMap[req.path] !== req.body.token) {
      return res.status(403).send('invalid token');
    }
  }

  next();
};
