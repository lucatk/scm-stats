const { getLatestCommit, getLatestCommitFromService } = require('../statsHandler');
const { makeResponse } = require('../utils');

module.exports = async (match, req, res) => {
  const { service, user } = req.query;
  
  let candidate;
  if (service) {
    candidate = await getLatestCommitFromService(service, user);
  } else {
    candidate = await getLatestCommit(user);
  }

  if (!candidate) {
    return res.status(404).end();
  }
  
  return res.json(makeResponse(candidate));
};