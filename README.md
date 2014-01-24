ttycolor
========

Terminal colors for [node][node] that respect whether the `stdout` and `stderr` streams are a `tty`.

## Features

* Extends the familiar `console` functions
* Always respects whether the stream is a tty
* Chainable attributes, foreground colors and background colors
* Asynchronous write to any stream respecting `tty.isatty`
* Default styles to keep the code clean
* Comprehensive test suite

<p align="center">
  <img src="https://raw.github.com/freeformsystems/ttycolor/master/img/colors.png" />
</p>

<p align="center">
  <img src="https://raw.github.com/freeformsystems/ttycolor/master/img/cat.png" />
</p>

<p align="center">
  <img src="https://raw.github.com/freeformsystems/ttycolor/master/img/source.png" />
</p>

## Installation

```
npm install ttycolor
```

## Test

```
npm test
```

## API

```javascript
var ansi = require('ttycolor').ansi;
// no colors, normal console operation
console.log('%s', 'value');
console.log('%d', 3.14);
console.log('%j', {message: 'json'});
console.log('a %s of %d with %j', 'value', 3.14, {message: 'json'});
// colors
console.log('%s', ansi('log message').white.bg.black);
console.info('%s', ansi('info message').cyan;
console.warn('%s', ansi('warn message').magenta;
console.error('%s', ansi('error message').bright.red);
console.log('pi %d', ansi(3.14).blue.underline);
console.log('%j', ansi({message: 'json'}).red);
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

#### console.write(options, format, ...)

Asynchronously write to an arbitrary writable stream with escape sequence support if the stream is a tty as reported by `tty.isatty`.

* `options`: The write options.
* `format`: The format string.
* `...`: The format replacement parameters.

The `options` object should contain the properties `stream` and `callback`. The `callback` is invoked when the write operation has completed and is passed the value written to the stream.

The `stream` must be open and have an associated `fd` or this method will throw an error.

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

#### debug(format, ...)

Utility to return an escaped string regardless of `isatty`, used for unit testing.

#### defaults(styles)

Configure default styles for the `console` functions.

* `styles`: Styles to use, if this option is not specified then the module default styles are used.

This method returns a closure that allows reverting to the previous `console` functions.

```javascript
var ttycolor = require('ttycolor'), defaults = ttycolor.defaults, revert;
revert = defaults();
console.log('log: a %s message', 'log');
revert();
console.log('log: a %s message', 'log');
```

#### foreground

Map of foreground color codes.

#### stringify(value, code, attr, tag)

Low-level method for creating escaped string sequences.

* `value`: The value to escape, will be coerced to a string.
* `code`: The color code.
* `attr`: Optional attribute code.
* `tag`: Optional close tag.

#### styles

Map of styles to use when no arguments are passed to `defaults()`.

### Styles

#### Foreground Colors

```javascript
console.log('%s', ansi('log message').white);
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

```javascript
console.log('%s', ansi('log message').bg.black);
```

Background colors are set by accessing a color property via the `bg` property. Property names are identical to the foreground color list.

Note that the background color chain is reset after accessing a color property such that order is not important when combining background and foreground colors, the following are all equivalent:

```javascript
ansi('value').bg.red.white.underline;
ansi('value').bg.red.underline.white;
ansi('value').underline.white.bg.red;
ansi('value').white.underline.bg.red;
ansi('value').white.bg.red.underline;
```

#### Attributes

```javascript
console.log('%s', ansi('log message').bright);
```

Depending upon the terminal emulator some attributes may not be supported and will have no visual effect. Typically `bright`, `underline` and `reverse` are safe to use.

* `bright`
* `dim`
* `italic`
* `underline`
* `blink`
* `reverse`

## License

Everything is [MIT](http://en.wikipedia.org/wiki/MIT_License). Read the [license](/LICENSE) if you feel inclined.

[node]: http://nodejs.org
