'use strict';

var tty = require('tty');
var util = require('util');

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

var re = /%[sdj]+/;

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

function proxy(term, method, format) {
  var replacing = re.test(format) && arguments.length > 3;
  var replacements = [].slice.call(arguments, 3);
  if(!replacing) return method.apply(console, replacements);
  var arg, i;
  for(i = 0;i < replacements.length;i++) {
    arg = replacements[i];
    if(arg instanceof AnsiColor) {
      replacements[i] = arg.valueOf(term);
    }
  }
  // we have already coerced to strings
  if(term) format = format.replace(/%[jd]/g, '%s');
  replacements.unshift(format);
  method.apply(console, replacements);
}

console.log = function(format) {
  var term = process.stdout.isTTY;
  var args = [term, stash.log, format];
  args = args.concat([].slice.call(arguments, 1));
  proxy.apply(null, args);
}

console.info = function(format) {
  var term = process.stdout.isTTY;
  var args = [term, stash.info, format];
  args = args.concat([].slice.call(arguments, 1));
  proxy.apply(null, args);
}

console.error = function(format) {
  var term = process.stderr.isTTY;
  var args = [term, stash.error, format];
  args = args.concat([].slice.call(arguments, 1));
  proxy.apply(null, args);
}

console.warn = function(format) {
  var term = process.stderr.isTTY;
  var args = [term, stash.warn, format];
  args = args.concat([].slice.call(arguments, 1));
  proxy.apply(null, args);
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

AnsiColor.prototype.valueOf = function(term) {
  if(!term) return this.v;
  var list = [this.t[this.k]];
  var p = this.p, a;
  while(p) {
    if(p.t[p.k]) list.push(p.t[p.k]);
    p = p.p;
  }
  list.reverse();
  for(var i = 0;i < list.length;i++){
    this.v = codes.open(list[i], this.a) + this.v + codes.close();
  }
  //console.dir(this.v);
  return this.v;
}

AnsiColor.prototype.bg = function() {
  var ansi = new AnsiColor(this.v, this.k, this);
  ansi.t = definition.bg.colors;
  return ansi;
}

AnsiColor.prototype.bright = function() {
  var ansi = new AnsiColor(this.v, this.k, this);
  ansi.a = 1;
  return ansi;
}

AnsiColor.prototype.reverse = function() {
  var ansi = new AnsiColor(this.v, this.k, this);
  ansi.a = 7;
  return ansi;
}

AnsiColor.prototype.blink = function() {
  var ansi = new AnsiColor(this.v, this.k, this);
  ansi.a = 5;
  return ansi;
}

AnsiColor.prototype.underline = function() {
  var ansi = new AnsiColor(this.v, this.k, this);
  ansi.a = 4;
  return ansi;
}

Object.keys(definition.colors).forEach(function (k) {
  AnsiColor.prototype[k] = function () {
    this.k = k;
    return this;
  };
});

var ansi = function(v) {
  return new AnsiColor(v);
}

module.exports = {
  console: stash,
  ansi: ansi
}
