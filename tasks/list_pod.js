const utils = require('../utils');
const _ = require('lodash');

function getPodsByEmail(pods, email) {
  return pods.filter(pod => {
    return _.find(pod.Parameters, { ParameterKey: 'Creator', ParameterValue: email });
  });
}

module.exports = (req, res) => {

  let userEmail = utils.getUserEmail(req.query.user_id);
  const overrideEmail = (req.query.text || '').trim();
  // if specifying another persons email
  if (overrideEmail && overrideEmail.indexOf('@symphonycommerce.com') !== -1) {
    userEmail = overrideEmail;
  }

  return utils.getPods()
    .then(pods => {
      const userPods = getPodsByEmail(pods, userEmail);
      const userPodsInfo = userPods.map(pod => {
        const param = utils.cfParam2Obj(pod.Parameters);
        return {
          podName: param.PodName,
          branch: param.GitBranch,
          createdAt: pod.CreationTime,
          status: pod.StackStatus,
        };
      });
      const info = userPodsInfo.reduce((sum, next) => {
        const str = _.map(next, (val, key) => {
          return `${key}: ${val}`;
        }).join(' | ') + '\n';
        return sum + str;
      }, '');
      res.status(200).send(info);
    })
    .catch(err => {
      res.status(500).send(err);
    });
};
