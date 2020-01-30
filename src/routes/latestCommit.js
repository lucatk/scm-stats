const config = require('../configHandler').getConfig();
const { getLatestCommit } = require('../statsHandler');
const { makeResponse } = require('../utils');

module.exports = async (match, req, res) => {
  const { service, user } = req.query;
  
  const candidate = await getLatestCommit(service, user);

  if (!candidate) {
    return res.status(404).end();
  }

  const data = {
    date: candidate.commit.author.date,
    repository: candidate.privateRepo ? null : candidate.repo,
    message: candidate.commit.message,
    url: candidate.privateRepo ? null : candidate.html_url
  };
  
  return res.json(makeResponse(data));
};