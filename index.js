var util = require('util')
  , circular = require('circular')
  , ansi = require('./lib/ansi'), AnsiColor = ansi.color
  , definition = ansi.codes, stringify = ansi.stringify
  , defaults = require('./lib/defaults')
  , parse = require('./lib/parse')
  , stream = require('./lib/stream')
  , stash = require('./lib/stash')
  , initialized = false
  , defaultStyles = defaults.defaultStyles;

/**
 *  Escapes replacement values.
 *
 *  @param options Proxy configuration options.
 *  @param options.tty A boolean indicating whether the output is a tty.
 *  @param options.method A method to proxy to.
 *  @param options.stream A writable stream to write to.
 *
 *  @param format The format string.
 *  @param ... The format string arguments.
 */
function proxy(options, format) {
  var tty = options.tty
    , method = options.method
    , re = /(%[sdj])+/g
    , start
    , end;
  if(arguments.length === 1) {
    return method.apply(console, []);
  }
  var arg, i, replacing, replacements, matches, tag;
  replacing = (typeof format === 'string')
    && re.test(format) && arguments.length > 2;
  replacements = [].slice.call(arguments, 2);
  if(format instanceof AnsiColor) {
    replacing = true;
    if(!replacements.length) {
      replacements.unshift(format); format = '%s';
    }
  }
  if(!replacing) {
    replacements.unshift(format);
    return method.apply(console, replacements);
  }
  matches = (format && (typeof format.match === 'function')) ?
    format.match(re) : [];
  if(format instanceof AnsiColor) {
    if(!tty) {
      format = format.v;
    }else{
      tag = format.start(tty);
      format = format.valueOf(tty);
    }
  }

  //console.dir('is tty: ' + tty);
  if(tty) {
    re = /(%[sdj])/g;
    var fmt, result, j = 0;
    while((result = re.exec(format))) {
      if(j === replacements.length) {
        break;
      }
      arg = replacements[j];
      //console.dir('processing ansi replacement: ' + typeof(arg));
      fmt = result[1];
      start = format.substr(0, result.index);
      end = format.substr(result.index + result[0].length);
      //console.dir('re format: ' + fmt);
      //console.dir('re start: ' + start);
      //console.dir('re end: ' + end);
      if((arg instanceof AnsiColor)) {
        //console.dir('update arg value: ' + typeof(arg.v));
        if(fmt === '%j') {
          arg.v = JSON.stringify(arg.v, circular());
        }
        format = start + '%s' + end;
      }
      j++;
    }
  }

  for(i = 0;i < replacements.length;i++) {
    arg = replacements[i];
    if(arg instanceof AnsiColor) {
      replacements[i] = arg.valueOf(tty, tag);
    }
  }
  replacements.unshift(format);
  return method.apply(options.scope ? options.scope : console, replacements);
}

function isatty(tty) {
  if(module.exports.mode === parse.always) {
    return true;
  }
  if(module.exports.mode === parse.never) {
    return false;
  }
  return tty;
}

// allows redirecting all message to stderr
var error = false;
function stderr(err) {
  if(!arguments.length) {
    return error;
  }
  error = err;
  return error;
}

function initialize(force) {
  if(initialized && !force) {
    return false;
  }

  // stream write
  main.write = function(options) {
    options.proxy = proxy;
    options.mode = module.exports.mode;
    options.isatty = isatty;
    var args = [].slice.call(arguments, 1);
    args.unshift(options);
    stream.apply(null, args);
  }

  // console functions
  stash.keys.forEach(function (k) {
    var stream = (k === 'info' || k === 'log') ?
      process.stdout : process.stderr;
    console[k] = function() {
      if(error) {
        stream = process.stderr;
      }
      var tty = isatty(stream.isTTY, module.exports.mode);
      var args = [{tty: tty, method: error ? stash.error : stash[k]}];
      var rest = [].slice.call(arguments, 0);
      args = args.concat(rest);
      proxy.apply(null, args);
    }
  });
  initialized = true;
}

/**
 *  Retrieve a formatted string.
 */
function format(fmt) {
  var args = [].slice.call(arguments, 0);
  var tty = true;
  var test = (typeof fmt === 'function') ? fmt : null;
  if(test) {
    tty = test();
    args.shift();
  }
  args.unshift({scope: util, method: util.format, tty: tty});
  //console.dir(args);
  return proxy.apply(null, args);
}

/**
 *  Proxies to defaults() lazily initializing.
 *
 *  This implies initialization when using default styles
 *  such that:
 *
 *  require('ttycolor').defaults();
 *
 *  Is equivalent to:
 *
 *  require('ttycolor')().defaults();
 *
 *  @param styles Custom styles to pass to defaults().
 *  @param option An option to pass to main().
 *  @param parser A parser to pass to main().
 *  @param force Force initialization.
 */
function defs(styles, option, parser, force) {
  if(!initialized || force) {
    main(option, parser, force);
  }
  if(typeof option === 'boolean') {
    stderr(option);
  }
  var revert = defaults(styles);
  module.exports.revert = revert;
  return revert;
}

/**
 *  Module main entry point to initialize
 *  console method overrides.
 *
 *  @param option The option name to use when parsing
 *  command line argments.
 *  @param parser The command line parser implementation.
 *  @param force Force initialization.
 */
function main(option, parser, force) {
  if(typeof option === 'function') {
    parser = option;
    option = null;
  }
  if(option !== false) {
    option = option || parse.option;
    parser = parser || parse;
  }
  //var mode = parse.auto;
  if(typeof parser === 'function') {
    module.exports.mode = parser(parse.modes, option, process.argv.slice(2));
  }
  initialize(force);
  return module.exports;
}

module.exports = main;
module.exports.mode = parse.auto;
module.exports.console = stash;
module.exports.keys = stash.keys;
module.exports.cache = defaults.cache;
module.exports.ansi = ansi;
module.exports.colors = Object.keys(definition.colors);
module.exports.attributes = definition.attrs;
module.exports.foreground = definition.colors;
module.exports.background = definition.bg.colors;
module.exports.stringify = stringify;
module.exports.defaults = defs;
module.exports.defaultStyles = defaultStyles;
module.exports.styles = defaults.styles;
module.exports.modes = parse.modes;
module.exports.parser = parse;
module.exports.format = format;
module.exports.stderr = stderr;

var map = {};
module.exports.colors.forEach(function(k) {
  map[k] = k;
})

module.exports.map = map;
