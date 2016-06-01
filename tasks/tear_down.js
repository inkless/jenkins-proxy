var callJenkins = require('../utils').callJenkins;

module.exports = function (req, res) {
  if (!req.query.text) {
    return res.status(400).send('invalid parameters');
  }

  var qs = {
    job: process.env.TEAR_DOWN_JOB,
    token: process.env.TEAR_DOWN_TOKEN,
    pod_name: req.query.text.trim(),
  };

  callJenkins(qs)
    .then(function () {
      res.status(200).send('Pod tear down successful!');
    })
    .catch(function (err) {
      return res.status(200).send('Pod tear down failed:' + err);
    });
};
