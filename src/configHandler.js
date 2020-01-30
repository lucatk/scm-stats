const fs = require('fs');

const { getProjectRoot } = require('./utils');

module.exports = {
  getPath: () => `${getProjectRoot()}/.scm-stats/config.json`,
  getConfig: () => require(module.exports.getPath()),
  updateService: async (serviceName, updatedService) => {
    const config = module.exports.getConfig();
    config.services[serviceName] = updatedService;
    try {
      const result = await module.exports.saveConfig(config);
      return result;
    } catch(error) {
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