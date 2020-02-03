const oauth = require('./oauth');

const vars = require('./serviceVars');
const { getConfig } = require('./configHandler');

const getServiceConfig = async (service) => {
  const config = await getConfig();
  return ((config || {}).services || {})[service];
}

const getOauthSetup = (service) => oauth.setupService(service, () => getServiceConfig(service), vars[service], config.publicUrl);
module.exports = {
  github: () => getOauthSetup('github'),
  gitlab: () => getOauthSetup('gitlab')
};