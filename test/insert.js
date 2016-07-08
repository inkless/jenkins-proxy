const podModel = require('../model/pod_creation');

podModel.insert(parseInt(Math.random() * 10000).toString(), Math.floor(Math.random() * 5))
  .then(console.log)
  .catch(console.log);

// podModel.insert('joeFixLegoDef', 1)
//   .then(console.log)
//   .catch(console.log);
//
// podModel.insert('gaPluginUpdateChrisk2', 1)
//   .then(console.log)
//   .catch(console.log);

