const camelCase = require('camelcase');
const utils = require('../utils');

module.exports = (req, res) => {

  const userId = req.query.user_id;
  const user = utils.getUser(userId);
  const creator = user.profile.email;
  const text = req.query.text.trim().split(' ');
  const branch = text[0];
  const name = text[1] || camelCase(branch);
  const qs = {
    job: process.env.CREATE_POD_JOB,
    token: process.env.CREATE_POD_TOKEN,
    pod_name: name,
    pod_creator: creator,
    deploy_git_branch: branch,
    ansible_branch: 'master',
    es_async_branch: 'master',
    cause: 'slack',
  };

  utils.callJenkins(qs)
    .then(() => {
      res.status(200).send('Create pod successful!');
    })
    .catch(err => {
      return res.status(200).send('Create pod failed:' + err);
    });
};
