const crypto = require('crypto');

module.exports = {
  getProjectRoot: () => process.mainModule.paths[0].split('node_modules')[0].slice(0, -1),
  generateRandomToken: async () => crypto.randomBytes(20).toString('hex'),
  encodeBase64: (string) => Buffer.from(string).toString('base64'),
  traverseObject: (object, path) => {
    let subObject = object;
    path.forEach((subp) => {
      if (!subObject) subObject = {};
      subObject = subObject[subp];
    });
    return subObject;
  },
  modifyTraversedObject: (object, path, newInner) => {
    if (path.length === 0) return newInner;
    let subObjects = [];
    let currentSub = object;
    path.forEach((subp, i) => {
      if (!currentSub) currentSub = {};
      subObjects[i] = currentSub;
      currentSub = currentSub[subp];
    });
    subObjects[path.length] = newInner;
    for (let i = path.length; i > 0; i--) {
      subObjects[i-1] = {
        ...subObjects[i-1],
        [path[i-1]]: subObjects[i]
      };
    }
    return subObjects[0];
  },
  retrievePathFromUrl: (publicUrl) => new URL(publicUrl).pathname,
  makeResponse: (data) => ({
    result: (data && data.error) ? 'error' : 'success',
    ...data
  })
};