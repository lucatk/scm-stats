module.exports = (match, req, res) => {
  return res.end(JSON.stringify({ url: 'latest_commit', match, query: req.query }));
};