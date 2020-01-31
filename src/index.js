// ensure required files exist
require('./cacheHandler');

const configHandler = require('./configHandler');
const routes = require('./routes');
const { retrievePathFromUrl } = require('./utils');

let config;

module.exports = async (req, res, next) => {
  if (!config) config = await configHandler.getConfig();
  let { url } = req;
  const rootUrl = retrievePathFromUrl(config.publicUrl);
  if (rootUrl !== '/' && url.startsWith(rootUrl)) url = url.replace(rootUrl, '');
  const match = url.match(/^\/([-\w;:@+$\|\_.!~*\|'()\[\]%#,☺]+)(?:\/([^?]*))?.*$/);
  if (match && match[1] && routes[match[1]]) {
    return await routes[match[1]](match, req, res);
  }
  next();
};