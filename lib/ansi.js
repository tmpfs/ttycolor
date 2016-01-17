var definition = require('./codes');

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
 *  Chainable color builder.
 *
 *  @param value The underlying value to be escaped.
 *  @param key The key for the code lookup.
 *  @param parent A parent color instance.
 */
var AnsiColor = function(value, key, parent){
  this.t = definition.colors;   // table of color codes
  this.v = value;               // value wrapped by this instance
  this.k = key;                 // property name, eg 'red'
  this.p = parent;              // parent
  this.a = null;                // attribute
}

/**
 *  Retrieve list of parent instances.
 */
AnsiColor.prototype.parents = function() {
  var list = [this], p = this.p;
  while(p) {
    list.push(p);
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
  if(!tty) {
    return '';
  }
  var list = this.parents(), i, p;
  var o = ANSI_CLOSE;
  for(i = 0;i < list.length;i++){
    p = list[i];
    if(!p.k) {
      continue;
    }
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
  if(!tty) {
    return this.v;
  }
  var list = this.parents(), i, p;
  for(i = 0;i < list.length;i++){
    p = list[i];
    if(!p.k) {
      continue;
    }
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
      var ansi = new AnsiColor(this.v, this.k, this);
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
    if(this.k && this.t === definition.bg.colors && this.p && !this.p.k) {
      return new AnsiColor(this.v, k, this);
    }
    this.k = k;
    // allow color functions after multiple attribute chains
    if(this.p && this.p.a && this.p.k === 'normal') {
      this.p.k = this.k;
    }
    return this;
  });
});

function ansi(v) {
  return new AnsiColor(v);
}

module.exports = ansi;
module.exports.color = AnsiColor;
module.exports.codes = definition;
module.exports.stringify = stringify;
