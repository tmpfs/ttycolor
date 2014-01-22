'use strict';

var tty = require('tty');
var util = require('util');
var WritableStream = require('stream').Writable;

var stash = {
  log: console.log,
  info: console.info,
  error: console.error,
  warn: console.warn
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

var codes = {
  open: function(v, a) {
    return a ? ANSI_OPEN + a + ';' + v + ANSI_FINAL
      : ANSI_OPEN + v + ANSI_FINAL;
  },
  close: function() {
    return ANSI_CLOSE;
  }
}

/**
 *  Low-level method for creating escaped string sequences.
 *
 *  @param value The value to escape.
 *  @param code The color code.
 *  @param attr An optional attribute code.
 */
function stringify(value, code, attr) {
  return codes.open(code, attr) + value + codes.close();
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
  var term = options.tty;
  var method = options.method;
  if(arguments.length == 1) return method.apply(console, []);
  var re = /(%[sdj])+/g;
  var replacing = (typeof format == 'string')
    && re.test(format) && arguments.length > 2;
  var replacements = [].slice.call(arguments, 2);
  if(format instanceof AnsiColor) {
    replacements.unshift(format);
    format = '%s';
    replacing = true;
  }
  if(!replacing) {
    replacements.unshift(format);
    return method.apply(console, replacements);
  }
  var arg, i, json;
  var matches = (format && (typeof format.match == 'function')) ?
    format.match(re) : [];
  for(i = 0;i < replacements.length;i++) {
    arg = replacements[i];
    json = matches[i] == '%j';
    if(arg instanceof AnsiColor) {
      if(json && term) {
        arg.v = JSON.stringify(arg.v);
      }
      replacements[i] = arg.valueOf(term);
    }else if(json && term){
      replacements[i] = JSON.stringify(replacements[i]);
    }
  }
  // we have already coerced to strings
  if(term) {
    for(i = 0;i < replacements.length;i++) {
      format = format.replace(/%[jd]/, '%s');
    }
  }
  replacements.unshift(format);
  return method.apply(options.scope ? options.scope : console, replacements);
}

/**
 *  Chainable ANSI color builder.
 *
 *  @param value The underlying value to be escaped.
 *  @param key The key for the code lookup.
 *  @param parent A parent color instance.
 */
var AnsiColor = function(value, key, parent){
  this.t = definition.colors;
  this.v = value;
  this.k = key || 'normal';
  this.p = parent;
  this.a = null;
};

AnsiColor.prototype.valueOf = function(term) {
  if(!term) return this.v;
  var list = [this];
  var p = this.p;
  //if(p) list.push(p);
  while(p) {
    if(p) {
      list.push(p);
    }
    p = p.p;
  }
  list.reverse();
  // handle attribute only chains
  //if(list.length == 1 && this.a && !this.k) {
    //list[0] = definition.colors.normal;
  //}
  for(var i = 0;i < list.length;i++){
    p = list[i];
    this.v = stringify(this.v, p.t[p.k], p.a);
  }
  return this.v;
}

AnsiColor.prototype.bg = function() {
  var ansi = new AnsiColor(this.v, this.k, this);
  ansi.t = definition.bg.colors;
  return ansi;
}

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
    var args = [{scope: util, method: util.format, tty: tty.isatty(stream.fd)}];
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
    var term = stream.isTTY;
    var args = [{tty: term, method: stash[k]}];
    var rest = [].slice.call(arguments, 0);
    args = args.concat(rest);
    proxy.apply(null, args);
  }
});

// attributes
Object.keys(definition.attrs).forEach(function (k) {
  AnsiColor.prototype[k] = function () {
    if(this.a) {
      var ansi = new AnsiColor(this.v, this.k, this);
      ansi.a = definition.attrs[k];
      return ansi;
    }
    this.a = definition.attrs[k];
    return this;
  };
});

// colors
Object.keys(definition.colors).forEach(function (k) {
  AnsiColor.prototype[k] = function () {
    this.k = k;
    return this;
  };
});

module.exports = {
  console: stash,
  ansi: function(v) {
    return new AnsiColor(v);
  },
  colors: Object.keys(definition.colors),
  attributes: definition.attrs,
  foreground: definition.colors,
  background: definition.bg.colors,
  stringify: stringify,
  debug: function() {
    var args = [{scope: util, method: util.format, tty: true}];
    args = args.concat([].slice.call(arguments, 0));
    return proxy.apply(null, args);
  }
}
