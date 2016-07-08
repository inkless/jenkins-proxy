const camelCase = require('camelcase');
const utils = require('../utils');
const podModel = require('../model/pod_creation');

const DEFAULT_SPOT_PRICE = 0.075;
const MAX_SPOT_PRICE = 0.163;
const DEFAULT_PERSIST_DAY = 3;

module.exports = (req, res) => {

  const creator = utils.getUserEmail(req.query.user_id);
  const text = req.query.text.trim().split(' ');
  const branch = text[0];
  const name = text[1] || camelCase(branch);
  const price = parseFloat(text[2]) || DEFAULT_SPOT_PRICE;
  const persistDay = parseInt(text[3]) || DEFAULT_PERSIST_DAY;

  if (price > MAX_SPOT_PRICE) {
    return res.status(200).send(`Spot price should not be greater than ${MAX_SPOT_PRICE}`);
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
    expires: persistDay * 24,
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
