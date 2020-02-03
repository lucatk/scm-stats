const setupHandler = require('../setupHandler');
const { makeResponse } = require('../utils');

module.exports = async (match, req, res) => {
  const { service } = req.query;
  if (!service) {
    return res.status(400).end();
  }
  const setup = await setupHandler[service]();
  if (!setup) {
    return res.status(400).end();
  }
  try {
    const result = await setup(req.query);
    return res.json(
      makeResponse(result)
    );
  } catch (error) {
    return res.status(500).json(
      makeResponse({
        error: error.message
      })
    );
  }
};