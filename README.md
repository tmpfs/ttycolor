ttycolor
========

Terminal colors for [node][node] that respect whether the `stdout` and `stderr` streams are
a `tty`.

## Installation

```
npm install ttycolor
```

## API

```
var ansi = require('ttycolor').ansi;
// no colors, normal console operation
console.log('%s', 'value');
console.log('%d', 3.14);
console.log('%j', {message: 'json'});
console.log('a %s of %d with %j', 'value', 3.14, {message: 'json'});
// colors
console.log('%s', ansi('log message').white().bg().black());
console.info('%s', ansi('info message').cyan());
console.warn('%s', ansi('warn message').magenta());
console.error('%s', ansi('error message').bright().red());
console.log('pi %d', ansi(3.14).blue().underline());
console.log('%j', ansi({message: 'json'}).red());
```

### ansi(value)

Wrap `value` in a chainable color instance, the `value` will be coerced
to a string when passed to a `console` function.

### attributes

Map of ANSI attribute codes.

### background

Map of background color codes.

### colors

Array of color names.

### console

Map referencing the original `console` methods.

### foreground

Map of foreground color codes.

### stringify(value, code, attr)

Convert a value to an ANSI escape sequence.

* `value`: The value to escape, will be coerced to a string.
* `code`: The color code.
* `attr`: Optional attribute code. 

[node]: http://nodejs.org
