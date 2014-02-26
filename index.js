var util = require('util');
var circular = require('circular');

var ansi = require('./lib/ansi'), AnsiColor = ansi.color;
var definition = ansi.codes, stringify = ansi.stringify;
var defaults = require('./lib/defaults');
var parse = require('./lib/parse');
var stream = require('./lib/stream');
var stash = require('./lib/stash');
var initialized = false;
var styles = defaults.styles;

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
  var tty = options.tty, method = options.method, re = /(%[sdj])+/g;
  if(arguments.length == 1) return method.apply(console, []);
  var arg, i, replacing, replacements, matches, tag;
  replacing = (typeof format == 'string')
    && re.test(format) && arguments.length > 2;
  replacements = [].slice.call(arguments, 2);
  // debug
  //console.dir('ttycolor format: ' + format);
  //replacements.forEach(function(item) {
    //console.dir('replacement type: ' + typeof(item));
    //console.dir('is ansi: ' + (item instanceof AnsiColor));
    //if(item instanceof AnsiColor) {
      //console.dir('value type: ' + typeof(item.v));
    //}
    //console.dir(item instanceof AnsiColor ? item.v : item);
  //})
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
  matches = (format && (typeof format.match == 'function')) ?
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
    var re = /(%[sdj])/g, fmt, result, j = 0;
    while(result = re.exec(format)) {
      if(j === replacements.length) break;
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
        if(fmt === '%j') arg.v = JSON.stringify(arg.v, circular());
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
  if(module.exports.mode == parse.always) return true;
  if(module.exports.mode == parse.never) return false;
  return tty;
}

function initialize(force) {
  if(initialized && !force) return false;

  //console.log('mode override %s', module.exports.mode);
  //if(typeof module.exports.mode === 'string'
    //&& ~parse.modes.indexOf(module.exports.mode)) {
    //console.log('setting mode to %s', module.exports.mode);
  //}

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
    var stream = (k == 'info' || k == 'log') ?
      process.stdout : process.stderr;
    console[k] = function(format) {
      var tty = isatty(stream.isTTY, module.exports.mode);
      var args = [{tty: tty, method: stash[k]}];
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
function format(format) {
  var args = [].slice.call(arguments, 0);
  var tty = true;
  var test = (typeof format == 'function') ? format : null;
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
  if(typeof option == 'function') {
    parser = option;
    option = null;
  }
  if(option !== false) {
    option = option || parse.option;
    parser = parser || parse;
  }
  //var mode = parse.auto;
  if(typeof parser == 'function') {
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
module.exports.styles = styles;
module.exports.modes = parse.modes;
module.exports.parser = parse;
module.exports.format = format;
