require('dotenv').config();

var express = require('express');
var request = require('request');
var app = express();
var bodyParser = require('body-parser');
var PORT = 5555;

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(require('./auth'));

app.get('/', function (req, res) {
  res.send('This is a jenkins proxy');
});

app.post('/create_pod', require('./tasks/create_pod'));
app.post('/create_pod_v2', require('./tasks/create_pod_v2'));
app.post('/integration_test', require('./tasks/integration_test'));
app.post('/tear_down', require('./tasks/tear_down'));
app.post('/list_pod', require('./tasks/list_pod'));

app.listen(PORT, function (err) {
  if (err) {
    console.log(err);
  }

  console.info('==> 🌎 Listening on port %s.', PORT);
});
