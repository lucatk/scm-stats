const fs = require('fs');

const { getProjectRoot } = require('./utils');
const path = `${getProjectRoot()}/.scm-stats/cache.json`;

fs.exists(path, (exists) => {
  if (!exists) {
    fs.writeFile(path, JSON.stringify({}, null, 2), (err) => {
      if (err) console.log(err);
    });
  }
});

module.exports = {
  getPath: () => path,
  getCache: () => require(module.exports.getPath()),
  getStat: (stat) => module.exports.getCache()[stat],
  updateStat: async (stat, updatedStat) => {
    const cache = module.exports.getCache();
    cache[stat] = updatedStat;
    try {
      const result = await module.exports.saveCache(cache);
      return result;
    } catch(error) {
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