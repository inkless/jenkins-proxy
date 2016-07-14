var callJenkins = require('../utils').callJenkins;

module.exports = function (req, res) {
  if (!req.body.text) {
    return res.status(400).send('invalid parameters');
  }

  var qs = {
    job: process.env.INTEGRATION_TEST_JOB,
    token: process.env.INTEGRATION_TEST_TOKEN,
    BRANCH_NAME: req.body.text.trim(),
  };

  callJenkins(qs)
    .then(function () {
      res.status(200).send('Integration test created successful!');
    })
    .catch(function (err) {
      return res.status(200).send('Integration test create failed:' + err);
    });
};
