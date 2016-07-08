const podModel = require('../model/pod_creation');

podModel.getAll()
  .then(data => {
    console.log(data);
  })
  .catch(console.log);
