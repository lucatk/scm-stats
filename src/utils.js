const crypto = require('crypto');

module.exports = {
  getProjectRoot: () => process.mainModule.paths[0].split('node_modules')[0].slice(0, -1),
  generateRandomToken: async () => crypto.randomBytes(20).toString('hex'),
  makePublicUrl: (url) => `${require('./configHandler').getConfig().publicUrl}${url}`,
  makeResponse: (data) => ({
    result: (data && data.error) ? 'error' : 'success',
    ...data
  })
};