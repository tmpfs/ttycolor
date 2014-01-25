var ansi = require('./ansi'), AnsiColor = ansi.color;
var styles = require('./styles'), cache = {};

module.exports = function defaults(custom) {
  var props = custom || styles;
  var keys = Object.keys(styles);
  function convert(arg, names) {
    var prop;
    names = Array.isArray(names) ? names : [];
    names = names.slice(0);
    if(!(arg instanceof AnsiColor) && names.length) {
      arg = ansi(arg);
      while(prop = names.shift()) {
        arg = arg[prop];
      }
    }
    return arg;
  }
  keys.forEach(function(name) {
    cache[name] = console[name];
    console[name] = function() {
      var format = arguments[0];
      format = convert(format, props[name].format);
      var args = [].slice.call(arguments, 1), i;
      for(i = 0;i < args.length;i++) {
        args[i] = convert(args[i], props[name].parameters);
      }
      args.unshift(format);
      return cache[name].apply(null, args);
    }
  });
  function revert() {
    keys.forEach(function(name) {
      console[name] = cache[name];
    });
  }
  return revert;
}

module.exports.styles = styles;
