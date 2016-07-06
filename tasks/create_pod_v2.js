const camelCase = require('camelcase');
const utils = require('../utils');

module.exports = (req, res) => {

  const userId = req.query.user_id;
  const user = utils.getUser(userId);
  const creator = user.profile.email;
  const text = req.query.text.trim().split(' ');
  const branch = text[0];
  const name = text[1] || camelCase(branch);
  const price = parseFloat(text[2]) || 0.075;

  if (price > 0.163) {
    return res.status(200).send('Spot price should not be greater than .163');
  }

  const qs = {
    job: process.env.CREATE_POD_V2_JOB,
    token: process.env.CREATE_POD_V2_TOKEN,
    pod_name: name,
    pod_creator: creator,
    spot_instance: 'true',
    spot_price: price,
    your_git_branch: branch,
    ansible_branch: 'chris/role/new_pods',
    cause: 'slack',
    public_ip: '127.0.0.1',
    private_dns: '127.0.0.1',
    expires: 8,
  };

  utils.callJenkins(qs)
    .then(() => {
      res.status(200).send('Create pod successful!');
    })
    .catch(err => {
      return res.status(200).send('Create pod failed:' + err);
    });
};
