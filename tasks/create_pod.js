const camelCase = require('camelcase');
const utils = require('../utils');
const podModel = require('../model/pod_creation');

const DEFAULT_PERSIST_DAY = 3;

module.exports = (req, res) => {

  const creator = utils.getUserEmail(req.query.user_id);
  const text = req.query.text.trim().split(/ +/);
  if (!text[0]) {
    return res.status(200).send('Invalid Parameters');
  }
  const branch = text[0].replace(/\//g, '.');
  const name = (text[1] || camelCase(branch)).replace(/\./g, '');
  const persistDay = text[2] ?
    (
      isNaN(parseInt(text[2])) ?
      DEFAULT_PERSIST_DAY :
      parseInt(text[2])
    ) :
    DEFAULT_PERSIST_DAY;

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
      podModel.insert(name, persistDay)
        .catch(console.log);
    })
    .catch(err => {
      return res.status(200).send('Create pod failed:' + err);
    });
};
