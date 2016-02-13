var ansi = require('./ansi')
  , AnsiColor = ansi.color
  , styles = require('./styles')
  , cache = {}
  , initialized = false
  , keys = require('./stash').keys;

function revert() {
  if(!Object.keys(cache).length) {
    return;
  }
  keys.forEach(function(name) {
    console[name] = cache[name];
  });
  cache = {};
  initialized = false;
}

module.exports = function defaults(custom) {
  if(initialized) {
    return false;
  }
  var props = custom || styles;
  function convert(arg, names, style, index) {
    var prop;
    //console.dir(style);
    //console.dir(index);

    // replacement style for a given index
    // user defined function
    if(index !== undefined
      && style.replacements
      && typeof(style.replacements[index]) === 'function') {
      arg = style.replacements[index]
        .call(null, arg, style, names, index);
    }

    names = Array.isArray(names) ? names : [];
    names = names.slice(0);
    if(!(arg instanceof AnsiColor) && names.length) {
      arg = ansi(arg);
      while((prop = names.shift())) {
        arg = arg[prop];
      }
    }
    return arg;
  }
  keys.forEach(function(name) {
    cache[name] = console[name];
    console[name] = function() {
      if(!props[name]) {
        return cache[name].apply(console, arguments);
      }
      var format = arguments[0] || '';
      format = convert(format, props[name].format, props[name]);
      var args = [].slice.call(arguments, 1), i;
      for(i = 0;i < args.length;i++) {
        if(!(args[i] instanceof AnsiColor)) {
          args[i] = convert(args[i], props[name].parameters, props[name], i);
        }
      }
      args.unshift(format);
      return cache[name].apply(null, args);
    }
  });
  initialized = true;
  return revert;
}

module.exports.styles = styles;
module.exports.revert = revert;
module.exports.cache = cache;
