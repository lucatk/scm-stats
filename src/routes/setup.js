module.exports = (match, req, res) => {
  return res.end(JSON.stringify({ url: 'setup', match, query: req.query }));
};