var authTokenMap = {
  '/create_pod': process.env.CREATE_POD_SLACK_AUTH,
  '/integration_test': process.env.INTEGRATION_TEST_SLACK_AUTH,
  '/tear_down': process.env.TEAR_DOWN_SLACK_AUTH,
};

module.exports = function (req, res, next) {
  if (!req.query.token && req.url !== '/') {
    return res.status(403).send('no token specified');
  }

  if (req.query.token && authTokenMap[req.url]) {
    if (authTokenMap[req.url] !== req.query.token) {
      return res.status(403).send('invalid token');
    }
  }

  if (req.query.token && !req.query.text) {
    return res.status(400).send('invalid parameters');
  }

  next();
};
