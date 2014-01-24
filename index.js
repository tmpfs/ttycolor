'use strict';

var tty = require('tty');
var util = require('util');
var WritableStream = require('stream').Writable;

var auto = 'auto';
var never = 'never';
var always = 'always';

var COLOR_OPTION = '--color';
var NO_COLOR_OPTION = '--no-color';
var OPTION = {always: COLOR_OPTION, never: NO_COLOR_OPTION};

var cache = {}, stash = {
  log: console.log,
  info: console.info,
  error: console.error,
  warn: console.warn
}

var styles = {
  log: {format: ['normal'], parameters: ['normal', 'bright']},
  info: {format: ['cyan'], parameters: ['cyan', 'bright']},
  warn: {format: ['magenta'], parameters: ['magenta', 'bright']},
  error: {format: ['red'], parameters: ['red', 'bright']}
}

var definition = {
  colors: {
    normal          : 39,
    white           : 37,
    black           : 30,
    blue            : 34,
    cyan            : 36,
    green           : 32,
    yellow          : 33,
    magenta         : 35,
    red             : 31
  },
  bg: {
    colors: {
      normal        : 49,
      white         : 47,
      black         : 40,
      blue          : 44,
      cyan          : 46,
      green         : 42,
      yellow        : 43,
      magenta       : 45,
      red           : 41
    }
  },
  attrs: {
    bright          : 1,
    dim             : 2,
    italic          : 3,
    underline       : 4,
    blink           : 5,
    reverse         : 7
  }
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
};

AnsiColor.prototype.start = function(tty) {
  if(!tty) return '';
  var list = [this], p = this.p, i;
  while(p) {
    if(p) {
      list.push(p);
    }
    p = p.p;
  }
  list.reverse();
  var o = ANSI_CLOSE;
  for(i = 0;i < list.length;i++){
    p = list[i];
    if(!p.k) continue;
    o += open(p.t[p.k], p.a);
    //this.v = stringify(this.v, p.t[p.k], p.a, loose);
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
  var list = [this], p = this.p, i;
  while(p) {
    if(p) {
      list.push(p);
    }
    p = p.p;
  }
  list.reverse();
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
  if(mode == always) return true;
  if(mode == never) return false;
  return tty;
}

function initialize(mode) {
  /**
   *  Write a writable stream.
   *
   *  @param options.stream A writable stream.
   *  @param options.callback A callback to invoke once the data is written.
   *  @param format The format string.
   *  @param ...  The format string arguments.
   */
  console.write = function(options) {
    var stream = options.stream;
    if(stream instanceof WritableStream) {
      if(stream.fd == null) {
        throw new Error('Cannot write to stream, file descriptor not open');
      }
      var args = [
        {
          scope: util, method: util.format,
          tty: isatty(tty.isatty(stream.fd), mode)
        }
      ];
      args = args.concat([].slice.call(arguments, 1));
      var value = proxy.apply(null, args);
      stream.write(value, function() {
        if(typeof options.callback == 'function') options.callback(value);
      });
    }else{
      throw new Error('Stream option must be writable');
    }
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

function parse(option, argv) {
  option = option || {};
  argv = argv || process.argv.slice(2);
  option.always = option.always || COLOR_OPTION;
  option.never = option.never || NO_COLOR_OPTION;
  var i, arg;
  // default *auto* with no arguments
  if(!argv.length) {
    return auto;
  }else{
    for(i = 0;i < argv.length;i++) {
      arg = argv[i];
      if(arg == option.always) {
        return always;
      }else if(arg == option.never) {
        return never;
      }
    }
  }
  return auto;
}

module.exports = function(parser, option) {
  option = option || OPTION;
  parser = parser || parse;
  if(!(typeof parser == 'function')) {
    throw new Error('Argument parser must be a function');
  }
  var mode = parser(option);
  initialize(mode);
  return module.exports;
}

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
