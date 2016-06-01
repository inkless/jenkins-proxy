var camelCase = require('camelcase');
var callJenkins = require('../utils').callJenkins;

module.exports = function (req, res) {

  var text = req.query.text.trim().split(' ');
  var branch = text[0];
  var name = text[1];

  if (!name) {
    name = camelCase(branch);
  }

  var qs = {
    job: process.env.CREATE_POD_JOB,
    token: process.env.CREATE_POD_TOKEN,
    pod_name: name,
    deploy_git_branch: branch,
    ansible_branch: 'master',
    es_async_branch: 'master',
    cause: 'slack',
  };

  callJenkins(qs)
    .then(function () {
      res.status(200).send('Create pod successful!');
    })
    .catch(function (err) {
      return res.status(200).send('Create pod failed:' + err);
    });
};
