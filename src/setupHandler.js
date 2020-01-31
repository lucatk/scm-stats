const oauth = require('./oauth');

const vars = require('./serviceVars');

let config = {};
require('./configHandler').getConfig().then(cfg => {
  config = cfg;
});

module.exports = {
  github: () => oauth.setupService('github', (config.services || {}).github, vars.github, config.publicUrl),
  gitlab: () => oauth.setupService('gitlab', (config.services || {}).gitlab, vars.gitlab, config.publicUrl)
};