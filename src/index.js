module.exports = (req, res, next) => {
  const { url } = req;
  let match = url.match(/^\/([-\w;:@+$\|\_.!~*\|'()\[\]%#,☺]+)(?:\/([^?]*))?.*$/);
  if (match && match[1]) {
    return require('./routes')[match[1]](match, req, res);
  }
  next();
};