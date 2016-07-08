const utils = require('../utils');

module.exports = (req, res) => {
  if (!req.query.text) {
    return res.status(400).send('invalid parameters');
  }

  const podName = req.query.text.trim();
  utils.getPod(podName)
    .then(pod => {
      if (!pod) {
        return res.status(200).send('Pod does not exist');
      }
      return utils.tearDownByType(podName, pod.StackName);
    })
    .then(() => {
      res.status(200).send('Pod tear down successful!');
    })
    .catch(err => {
      console.log(err);
      return res.status(200).send(err);
    });
};
