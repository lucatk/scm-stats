const oauth = require('./oauth');

const vars = require('./serviceVars');
const { getConfig } = require('./configHandler');

let publicUrl;
const getPublicUrl = async () => {
  if (publicUrl) return publicUrl;
  const config = await getConfig();
  return (config || {}).publicUrl;
}
const getServiceConfig = async (service) => {
  const config = await getConfig();
  return ((config || {}).services || {})[service];
}

const getOauthSetup = async (service) => oauth.setupService(service, await getServiceConfig(service), vars[service], await getPublicUrl());
module.exports = {
  github: async () => getOauthSetup('github'),
  gitlab: async () => getOauthSetup('gitlab')
};