const fetch = require('isomorphic-unfetch');

const { updateService } = require('./configHandler');
const { generateRandomToken, encodeBase64 } = require('./utils');

module.exports = {
  setupService: (service, serviceConfigLoader, vars, publicUrl) => async ({ code, state }) => {
    const redirectUri = `${publicUrl}/setup?service=${service}`;
    if (code) {
      const config = await serviceConfigLoader();
      if (!state || !config.random_state || config.random_state !== state) {
        throw new Error('Invalid state token.');
      }
      
      try {
        const result = await module.exports.getAccessToken(vars, config.client_id, config.client_secret, code, state, redirectUri);
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
    } else if (config && config.client_id && config.client_secret) {
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
        url: `${vars.authorizationUrl}?client_id=${config.client_id}&redirect_uri=${redirectUri}&scope=${vars.scope}&state=${state}&response_type=code`
      };
    } else {
      throw new Error('Service config not found.');
    }
  },
  getAccessToken: async (vars, clientId, clientSecret, code, state, redirectUri) => {
    const res = await fetch(
      vars.accessTokenUrl,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${encodeBase64(`${clientId}:${clientSecret}`)}`
        },
        body: `code=${code}&state=${state}&scope=${vars.scope}&redirect_uri=${redirectUri}&grant_type=authorization_code`
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