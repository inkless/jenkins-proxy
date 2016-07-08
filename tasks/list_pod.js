const utils = require('../utils');
const _ = require('lodash');

function getPodsByEmail(pods, email) {
  if (email === 'all') {
    return pods;
  }

  return pods.filter(pod => {
    return _.find(pod.Parameters, { ParameterKey: 'Creator', ParameterValue: email });
  });
}

function getPodUrl(podName, type) {
  const name = podName.toLowerCase();
  if (type === 'new') {
    return {
      manage: `https://${name}-manage.symphonycommerce.com`,
      site: `https://${name}-kittydemo.symphonycommerce.com`,
    };
  }

  return {
    manage: `https://${name}-partner.symphonycommerce.com`,
    site: `https://${name}-sites.symphonycommerce.com`,
  };
}

module.exports = (req, res) => {

  let userEmail = utils.getUserEmail(req.query.user_id);
  const overrideEmail = (req.query.text || '').trim();
  // if specifying another persons email
  if (overrideEmail && overrideEmail.toLowerCase() === 'all') {
    userEmail = 'all';
  }
  else if (overrideEmail && overrideEmail.indexOf('@symphonycommerce.com') !== -1) {
    userEmail = overrideEmail;
  }

  return utils.getPods()
    .then(pods => {
      const userPods = getPodsByEmail(pods, userEmail);
      const userPodsInfo = userPods.map(pod => {
        const param = utils.cfParam2Obj(pod.Parameters);
        const createdAt = new Date(pod.CreationTime)
          .toISOString().replace(/T/, ' ').replace(/\..+/, '');
        const type = /-pod/.test(pod.StackName) ? 'new' : 'old';
        const urls = getPodUrl(param.PodName, type);
        const branch = `${param.GitBranch} <${urls.manage}|manage> <${urls.site}|site>`;

        return {
          podName: param.PodName,
          type,
          branch,
          createdAt,
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
