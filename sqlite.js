const sqlite3 = require('sqlite3');
const promisify = require('es6-promisify');

const config = require('./config');
const db = new sqlite3.Database(config.DB_PATH);

module.exports = {
  all: promisify(db.all, db),
  run: promisify(db.run, db),
};

