'use strict';

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
 *  Escapes replacement values.
 *
 *  @param term Indicates whether the stream is a tty.
 *  @param method The console method to invoke.
 *  @param format The format string.
 */
function proxy(term, method, format) {
  var re = /(%[sdj])+/g;
  var replacing = re.test(format) && arguments.length > 3;
  var replacements = [].slice.call(arguments, 3);
  if(!replacing) return method.apply(console, replacements);
  var arg, i, json;
  var matches = (format && (typeof format.match == 'function')) ?
    format.match(re) : [];
  for(i = 0;i < replacements.length;i++) {
    arg = replacements[i];
    json = matches[i] == '%j';
    if(arg instanceof AnsiColor) {
      if(json) {
        arg.v = JSON.stringify(arg.v);
      }
      replacements[i] = arg.valueOf(term, json);
    }else if(json){
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
  stringify: function(value, code, attr) {
    return codes.open(code, attr) + value + codes.close();
  }
}
