const fs = require('fs');

const { getProjectRoot } = require('./utils');
const path = `${getProjectRoot()}/.scm-stats/config.json`;

fs.exists(path, (exists) => {
  if (!exists) {
    fs.mkdir(path.substring(0, path.lastIndexOf('/')), { recursive: true }, (err) => {
      if (err) throw err;
    });
    fs.writeFile(path, JSON.stringify({
      publicUrl: 'http://localhost:3000'
    }, null, 2), (err) => {
      if (err) console.log(err);
    });
  }
});

module.exports = {
  getPath: () => path,
  getConfig: async () => {
    return new Promise((resolve, reject) => {
      fs.readFile(module.exports.getPath(), (err, data) => {
        if (err) return reject(err);
        return resolve(JSON.parse(data));
      });
    });
  },
  updateService: async (serviceName, updatedService) => {
    const config = await module.exports.getConfig();
    config.services[serviceName] = updatedService;
    try {
      const result = await module.exports.saveConfig(config);
      return result;
    } catch (error) {
      throw error;
    }
  },
  saveConfig: async (config) => {
    return new Promise((resolve, reject) => {
      fs.writeFile(module.exports.getPath(), JSON.stringify(config, null, 2), (err) => {
        if (err) return reject(err);
        return resolve();
      });
    });
  }
};