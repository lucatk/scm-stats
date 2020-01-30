const oauth = require('./oauth');

const vars = require('./serviceVars');
const config = require('./configHandler').getConfig();

module.exports = {
  github: () => oauth.setupService('github', (config.services || {}).github, vars.github),
  gitlab: () => oauth.setupService('gitlab', (config.services || {}).gitlab, vars.gitlab)
};