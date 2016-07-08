const db = require('../sqlite');
const TABLE_NAME = 'pod_creation';

exports.getAll = () => {
  return db.all(`SELECT * FROM ${TABLE_NAME}`);
};

exports.insert = (podName, persistDay) => {
  return db.run(`INSERT INTO ${TABLE_NAME} (pod_name, created_at, persist_day)
    VALUES(?, datetime("now"), ?)`, [podName, persistDay]);
};

exports.remove = podName => {
  return db.run(`DELETE FROM ${TABLE_NAME} WHERE pod_name = ?`, [ podName ]);
};
