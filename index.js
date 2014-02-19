'use strict';

var util = require('util');

var ansi = require('./lib/ansi'), AnsiColor = ansi.color;
var definition = ansi.codes, stringify = ansi.stringify;
var defaults = require('./lib/defaults');
var parse = require('./lib/parse');
var stream = require('./lib/stream');
var styles = defaults.styles;

var stash = {
  log: console.log,
  info: console.info,
  error: console.error,
  warn: console.warn
}

/**
 *  Escapes replacement values.
 *
 *  @param options.tty A boolean indicating whether the output is a tty.
 *  @param options.method A method to proxy to.
 *  @param options.stream A writable stream to write to.
 *
 *  @param options Write options.
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
  //console.dir(replacements);
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
  for(i = 0;i < replacements.length;i++) {
    arg = replacements[i];
    if(arg instanceof AnsiColor) {
      if(tty) {
        // we will coerce to strings
        format = format.replace(/%[jds]/g, '%s');
        if(matches[i] == '%j') {
          arg.v = JSON.stringify(arg.v);
        }
      }
      replacements[i] = arg.valueOf(tty, tag);
    }
  }
  replacements.unshift(format);
  return method.apply(options.scope ? options.scope : console, replacements);
}

function isatty(tty, mode) {
  if(mode == parse.always) return true;
  if(mode == parse.never) return false;
  return tty;
}

function initialize(mode) {

  // stream write
  main.write = function(options) {
    options.proxy = proxy;
    options.mode = mode;
    options.isatty = isatty;
    stream.apply(null, arguments);
  }

  // console functions
  Object.keys(stash).forEach(function (k) {
    var stream = (k == 'info' || k == 'log') ?
      process.stdout : process.stderr;
    console[k] = function(format) {
      var tty = isatty(stream.isTTY, mode);
      var args = [{tty: tty, method: stash[k]}];
      var rest = [].slice.call(arguments, 0);
      args = args.concat(rest);
      proxy.apply(null, args);
    }
  });
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
  return proxy.apply(null, args);
}

function main(option, parser) {
  if(typeof option == 'function') {
    parser = option;
    option = null;
  }
  option = option !== false ? (option || parse.option) : false;
  parser = option !== false ? (parser || parse) : false;
  var mode = parse.auto;
  if(typeof parser == 'function') {
    mode = parser(parse.modes, option, process.argv.slice(2));
  }
  initialize(mode);
  return module.exports;
}

module.exports = main;
module.exports.console = stash;
module.exports.cache = defaults.cache;
module.exports.ansi = ansi;
module.exports.colors = Object.keys(definition.colors);
module.exports.attributes = definition.attrs;
module.exports.foreground = definition.colors;
module.exports.background = definition.bg.colors;
module.exports.stringify = stringify;
module.exports.defaults = defaults;
module.exports.styles = styles;
module.exports.modes = parse.modes;
module.exports.format = format;
