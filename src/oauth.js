const fetch = require('isomorphic-unfetch');

const { updateService } = require('./configHandler');
const { generateRandomToken, makePublicUrl } = require('./utils');

module.exports = {
  setupService: (service, config, vars) => async ({ code, state }) => {
    if (code) {
      if (!state || !config.random_state || config.random_state !== state) {
        throw new Error('Invalid state token.');
      }
      
      try {
        const result = await module.exports.getAccessToken(vars, config.client_id, config.client_secret, code, state);
        if (result) {
          const data = {
            token: result
          };
          await updateService(service, data);
          return data;
        }
      } catch (error) {
        throw error;
      }
      throw new Error(result);
    } else if (config.client_id && config.client_secret) {
      const state = await generateRandomToken();
      try {
        await updateService(service, {
          ...config,
          random_state: state
        });
      } catch (error) {
        throw error;
      }
      return {
        url: `${vars.authorizationUrl}?client_id=${config.client_id}&redirect_uri=${makePublicUrl(`/setup?service=${service}`)}&scope=${vars.scope}&state=${state}&response_type=code`
      };
    } else {
      throw new Error('Service config not found.');
    }
  },
  getAccessToken: async (vars, clientId, clientSecret, code, state) => {
    const res = await fetch(
      `${vars.accessTokenUrl}?client_id=${clientId}&client_secret=${clientSecret}&code=${code}&state=${state}&grant_type=authorization_code`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    if (res.status === 200) {
      const json = await res.json();
      if (json.access_token) {
        return json.access_token;
      }
      throw new Error(json.error_description);
    } else {
      throw new Error(res.statusText);
    }
  }
};