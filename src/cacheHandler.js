const fs = require('fs');

const { getProjectRoot, traverseObject, modifyTraversedObject } = require('./utils');
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
  getCache: async () => {
    return new Promise((resolve, reject) => {
      fs.readFile(module.exports.getPath(), (err, data) => {
        if (err) return reject(err);
        return resolve(JSON.parse(data));
      });
    });
  },
  getStat: async (stat, path) => traverseObject(await module.exports.getCache()[stat], path),
  updateStat: async (stat, path, updatedStat) => {
    const cache = await module.exports.getCache() || {};
    cache[stat] = modifyTraversedObject(cache[stat], path, updatedStat);
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