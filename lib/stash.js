var stash = {
  log: console.log,
  info: console.info,
  error: console.error,
  warn: console.warn
}

var keys = Object.keys(stash);

module.exports = stash;
module.exports.keys = keys;
