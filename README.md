ttycolor
========

Terminal colors for [node][node] that respect whether the `stdout` and `stderr` streams are a `tty`.

## Features

* Extends the familiar `console` functions
* Always respects whether the stream is a tty
* Chainable attributes, foreground colors and background colors
* Asynchronous write to any stream respecting `tty.isatty`
* Comprehensive test suite

## Installation

```
npm install ttycolor
```

## Test

```
npm test
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

### Console

This package overrides the default `console` functions, you may access the original console functions via the `console` property exposed by the module. Note that the `console.dir` method is left untouched.

All overriden methods proxy to the original method after handling escape sequences.

#### console.log(format, ...)

Print a log message with escape sequence support, output is to `stdout`.

* `format`: The format string.
* `...`: The format replacement parameters.

#### console.info(format, ...)

Print an info message with escape sequence support, output is to `stdout`.

* `format`: The format string.
* `...`: The format replacement parameters.

#### console.warn(format, ...)

Print a warn message with escape sequence support, output is to `stderr`.

* `format`: The format string.
* `...`: The format replacement parameters.

#### console.error(format, ...)

Print an error message with escape sequence support, output is to `stderr`.

* `format`: The format string.
* `...`: The format replacement parameters.

### Module

#### ansi(value)

Wrap `value` in a chainable color instance, the `value` will be coerced to a string when passed to a `console` function.

#### attributes

Map of attribute codes.

#### background

Map of background color codes.

#### colors

Array of color names.

#### console

Map referencing the original `console` methods.

#### foreground

Map of foreground color codes.

#### stringify(value, code, attr)

Low-level method for creating escaped string sequences.

* `value`: The value to escape, will be coerced to a string.
* `code`: The color code.
* `attr`: Optional attribute code. 

### Styles

#### Foreground Colors

```
console.log('%s', ansi('log message').white());
```

* `normal`
* `white`
* `black`
* `blue`
* `cyan`
* `green`
* `yellow`
* `magenta`
* `red`

#### Background Colors

Background colors are set by invoking the `bg` function prior to a color function. Function names are identical to the foregound color list.

```
console.log('%s', ansi('log message').bg().black());
```

#### Attributes

Depending upon the temrinal emulator some attributes may not be supported and will have no visual effect. Typcially, `bright`, `underline` and `reverse` are safe to use.

```
console.log('%s', ansi('log message').bright());
```

* `bright`
* `dim`
* `italic`
* `underline`
* `blink`
* `reverse`

## License

Everything is [MIT](http://en.wikipedia.org/wiki/MIT_License). Read the [license](/LICENSE) if you feel inclined.

[node]: http://nodejs.org
