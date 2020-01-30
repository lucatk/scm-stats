const fs = require('fs');

const { getProjectRoot } = require('./utils');
const path = `${getProjectRoot()}/.scm-stats/cache.json`;

fs.exists(path, (exists) => {
  if (!exists) {
    fs.mkdir(path.substring(0, path.lastIndexOf('/')), { recursive: true }, (err) => {
      if (err) throw err;
    });
    fs.writeFile(path, JSON.stringify({}, null, 2), (err) => {
      if (err) console.log(err);
    });
  }
});

module.exports = {
  getPath: () => path,
  getCache: () => require(module.exports.getPath()),
  getStat: (stat, service) => (module.exports.getCache()[stat] || {})[service],
  updateStat: async (stat, service, updatedStat) => {
    const cache = module.exports.getCache();
    if (!cache[stat]) cache[stat] = {};
    cache[stat][service] = updatedStat;
    try {
      const result = await module.exports.saveCache(cache);
      return result;
    } catch (error) {
      throw error;
    }
  },
  saveCache: async (cache) => {
    return new Promise((resolve, reject) => {
      fs.writeFile(module.exports.getPath(), JSON.stringify(cache, null, 2), (err) => {
        if (err) return reject(err);
        return resolve();
      });
    });
  }
};