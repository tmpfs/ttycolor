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
    white           :  37,
    black           :  30,
    blue            :  34,
    cyan            :  36,
    green           :  32,
    magenta         :  35,
    red             :  31,
    yellow          :  33
  },
  bg: {
    colors: {
      black         :  40,
      red           :  41,
      green         :  42,
      yellow        :  43,
      blue          :  44,
      magenta       :  45,
      cyan          :  46,
      white         :  47
    }
  }
}

var attrs = {
  normal: 0,
  bright: 1,
  dim: 2,
  italic: 3,
  underline: 4,
  blink: 5,
  reverse: 7
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
  //console.dir(method);
  if(arguments.length == 1) return method.apply(console, []);
  var re = /(%[sdj])+/g;
  var replacing = (typeof format == 'string')
    && re.test(format) && arguments.length > 2;
  var replacements = [].slice.call(arguments, 2);
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
      replacements[i] = arg.valueOf(term, json);
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
  this.k = key;
  this.p = parent;
  this.a = null;
};

AnsiColor.prototype.valueOf = function(term, json) {
  if(!term) return this.v;
  var list = [this.t[this.k]];
  var p = this.p, a;
  while(p) {
    if(p.t[p.k]) list.push(p.t[p.k]);
    p = p.p;
  }
  list.reverse();
  for(var i = 0;i < list.length;i++){
    this.v = stringify(this.v, list[i], this.a);
  }
  //console.dir(this.v);
  return this.v;
}

AnsiColor.prototype.bg = function() {
  var ansi = new AnsiColor(this.v, this.k, this);
  ansi.t = definition.bg.colors;
  return ansi;
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

// attributes
Object.keys(attrs).forEach(function (k) {
  AnsiColor.prototype[k] = function () {
    var ansi = new AnsiColor(this.v, this.k, this);
    ansi.a = attrs[k];
    return ansi;
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
  attributes: attrs,
  foreground: definition.colors,
  background: definition.bg.colors,
  stringify: stringify,
  debug: function() {
    var args = [{scope: util, method: util.format, tty: true}];
    args = args.concat([].slice.call(arguments, 0));
    return proxy.apply(null, args);
  }
}
