require('dotenv').config();

var express = require('express');
var request = require('request');
var app = express();
var PORT = 5555;

app.use(require('./auth'));

app.get('/', function (req, res) {
  res.send('This is a jenkins proxy');
});

app.get('/create_pod', require('./tasks/create_pod'));
app.get('/create_pod_v2', require('./tasks/create_pod_v2'));
app.get('/integration_test', require('./tasks/integration_test'));
app.get('/tear_down', require('./tasks/tear_down'));
app.get('/list_pod', require('./tasks/list_pod'));

app.listen(PORT, function (err) {
  if (err) {
    console.log(err);
  }

  console.info('==> 🌎 Listening on port %s.', PORT);
});
