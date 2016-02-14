var ansi = require('./ansi')
  , AnsiColor = ansi.color
  , defaultStyles = require('./styles')
  , cache = {}
  , initialized = false
  , keys = require('./stash').keys
  , currentStyles;

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

/**
 *  Get or set the current styles.
 */
function styles(custom) {
  if(custom) {
    currentStyles = custom;
  }
  return currentStyles || defaultStyles;
}

function defaults(custom) {
  if(initialized) {
    return false;
  }

  if(custom) {
    styles(custom);
  }

  function convert(arg, names, style, index) {
    var prop;
    //console.dir(style);
    //console.dir(index);

    // replacement style for a given index
    // user defined function
    if(index !== undefined
      && style.params
      && typeof(style.params[index]) === 'function') {
      arg = style.params[index]
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
      var props = styles();
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

defaults.defaultStyles = defaultStyles;
defaults.revert = revert;
defaults.cache = cache;
defaults.styles = styles;

module.exports = defaults;



