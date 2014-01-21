'use strict';

var tty = require('tty');
var util = require('util');

var ANSI_OPEN = '\u001b[';
var ANSI_FINAL = 'm';
var ANSI_CLOSE_CODE = '39';
var ANSI_CLOSE = ANSI_OPEN + ANSI_CLOSE_CODE + ANSI_FINAL;

var re = /%[sdj]+/;

var stash = {
  log: console.log,
  info: console.info,
  error: console.error,
  warn: console.warn
}

var colors = {
    white         :  37
  , black         :  30
  , blue          :  34
  , cyan          :  36
  , green         :  32
  , magenta       :  35
  , red           :  31
  , yellow        :  33
  , brightBlack   :  90
  , brightRed     :  91
  , brightGreen   :  92
  , brightYellow  :  93
  , brightBlue    :  94
  , brightMagenta :  95
  , brightCyan    :  96
  , brightWhite   :  97
  }
, backgrounds = {
    bgBlack         :  40
  , bgRed           :  41
  , bgGreen         :  42
  , bgYellow        :  43
  , bgBlue          :  44
  , bgMagenta       :  45
  , bgCyan          :  46
  , bgWhite         :  47
  , bgBrightBlack   :  100
  , bgBrightRed     :  101
  , bgBrightGreen   :  102
  , bgBrightYellow  :  103
  , bgBrightBlue    :  104
  , bgBrightMagenta :  105
  , bgBrightCyan    :  106
  , bgBrightWhite   :  107
  }
;

function proxy(term, method, format) {
  var replacing = re.test(format) && arguments.length > 3;
  var replacements = [].slice.call(arguments, 3);
  if(!replacing) return method.apply(console, replacements);
  var arg, i;
  for(i = 0;i < replacements.length;i++) {
    arg = replacements[i];
    if(typeof arg == 'function' && arg.__colorize__) {
      replacements[i] = arg(term);
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

var ansi = {
  open: function(v) {
    return ANSI_OPEN + v + ANSI_FINAL;
  },
  close: function() {
    return ANSI_CLOSE;
  }
}

Object.keys(colors).forEach(function (k) {
  var o = ansi.open(colors[k]);
  var c = ansi.close();
  console[k] = function (v) {
    var closure = function(term) {
      if(!term) return v;
      return o + v + c;
    }
    closure.__colorize__ = true;
    return closure;
  };
});

module.exports = {
  console: stash,
  ansi: ansi
}

