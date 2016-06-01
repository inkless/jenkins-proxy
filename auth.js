module.exports = function (req, res, next) {
  if (req.query.token === process.env.SLACK_TOKEN) {
    console.log(req.query);
    next();
  } else {
    return res.status(403).send('invalid token');
  }
};
