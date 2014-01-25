'use strict';

var util = require('util');

var definition = require('./lib/ansi-codes');
var parse = require('./lib/parse');
var stream = require('./lib/stream');
var styles = require('./lib/styles');

var cache = {}, stash = {
  log: console.log,
  info: console.info,
  error: console.error,
  warn: console.warn
}

var ANSI_OPEN = '\u001b[';
var ANSI_FINAL = 'm';
var ANSI_CLOSE_CODE = '0';
var ANSI_CLOSE = ANSI_OPEN + ANSI_CLOSE_CODE + ANSI_FINAL;

/**
 *  Open an escape sequence.
 *
 *  @param code The color code.
 *  @param attr An optional attribute code.
 */
function open(code, attr) {
  return  attr ? ANSI_OPEN + attr + ';' + code + ANSI_FINAL
    : ANSI_OPEN + code + ANSI_FINAL;
}

/**
 *  Concatenate a close sequence.
 *
 *  @param value The value to close.
 */
function close(value, tag) {
  return value + (tag ? tag : ANSI_CLOSE);
}

/**
 *  Low-level method for creating escaped string sequences.
 *
 *  @param value The value to escape.
 *  @param code The color code.
 *  @param attr An optional attribute code.
 *  @param tag A specific closing tag to use.
 */
function stringify(value, code, attr, tag) {
  var s = open(code, attr);
  s +=  close(value, tag);
  return s;
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
        format = format.replace(/%[jds]/, '%s');
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

/**
 *  Chainable color builder.
 *
 *  @param value The underlying value to be escaped.
 *  @param key The key for the code lookup.
 *  @param parent A parent color instance.
 */
var AnsiColor = function(value, key, parent){
  this.t = definition.colors;
  this.v = value;
  this.k = key;
  this.p = parent;
  this.a = null;
}

/**
 *  Retrieve list of parent instances.
 */
AnsiColor.prototype.parents = function() {
  var list = [this], p = this.p;
  while(p) {
    if(p) {
      list.push(p);
    }
    p = p.p;
  }
  list.reverse();
  return list;
}

/**
 *  Retrieve a start escape sequence.
 *
 *  @param tty Whether the output stream is a terminal.
 */
AnsiColor.prototype.start = function(tty) {
  if(!tty) return '';
  var list = this.parents(), i, p;
  var o = ANSI_CLOSE;
  for(i = 0;i < list.length;i++){
    p = list[i];
    if(!p.k) continue;
    o += open(p.t[p.k], p.a);
  }
  return o;
}

/**
 *  Retrieve an escape sequence from the chain.
 *
 *  @param tty Whether the output stream is a terminal.
 *  @param tag A specific closing tag to use.
 */
AnsiColor.prototype.valueOf = function(tty, tag) {
  if(!tty) return this.v;
  var list = this.parents(), i, p;
  for(i = 0;i < list.length;i++){
    p = list[i];
    if(!p.k) continue;
    this.v = stringify(this.v, p.t[p.k], p.a, tag);
  }
  return this.v;
}

AnsiColor.prototype.__defineGetter__('bg', function() {
  var ansi = new AnsiColor(this.v, this.k, this);
  ansi.t = definition.bg.colors;
  return ansi;
});

// attributes
Object.keys(definition.attrs).forEach(function (k) {
  AnsiColor.prototype.__defineGetter__(k, function () {
    if(this.a) {
      var ansi = new AnsiColor(this.v, this.k || 'normal', this);
      ansi.a = definition.attrs[k];
      return ansi;
    }
    this.a = definition.attrs[k];
    this.k = this.k || 'normal';
    return this;
  });
});

// colors
Object.keys(definition.colors).forEach(function (k) {
  AnsiColor.prototype.__defineGetter__(k, function () {
    // reset the background color chain after color method invocation
    // allows invoking foreground colors after background colors
    if(this.k && this.t == definition.bg.colors && this.p && !this.p.k) {
      return new AnsiColor(this.v, k, this);
    }
    this.k = k;
    // allow color functions after multiple attribute chains
    if(this.p && this.p.a && this.p.k == 'normal') {
      this.p.k = this.k;
    }
    return this;
  });
});

function isatty(tty, mode) {
  if(mode == parse.always) return true;
  if(mode == parse.never) return false;
  return tty;
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

function ansi(v) {
  return new AnsiColor(v);
}

function defaults(custom) {
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

function debug() {
  var args = [{scope: util, method: util.format, tty: true}];
  args = args.concat([].slice.call(arguments, 0));
  return proxy.apply(null, args);
}

module.exports = main;
module.exports.console = stash;
module.exports.cache = cache;
module.exports.ansi = ansi;
module.exports.colors = Object.keys(definition.colors);
module.exports.attributes = definition.attrs;
module.exports.foreground = definition.colors;
module.exports.background = definition.bg.colors;
module.exports.stringify = stringify;
module.exports.debug = debug;
module.exports.defaults = defaults;
module.exports.styles = styles;
module.exports.modes = parse.modes;
