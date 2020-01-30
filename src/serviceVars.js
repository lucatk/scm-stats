module.exports = {
  github: {
    authorizationUrl: 'https://github.com/login/oauth/authorize',
    accessTokenUrl: 'https://github.com/login/oauth/access_token',
    // scope: 'repo%3Astatus',
    scope: 'repo%20user'
  },
  gitlab: {
    authorizationUrl: 'https://gitlab.com/oauth/authorize',
    accessTokenUrl: 'https://gitlab.com/oauth/token',
    scope: 'read_user%20read_repository%20api'
  }
}