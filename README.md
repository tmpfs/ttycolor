TTY ANSI Colors 
===============

## API

```
var ansi = require('ttycolor').ansi;
console.log('%s', ansi('log message').white().bg().black());
console.info('%s', ansi('info message').cyan());
console.warn('%s', ansi('warn message').magenta());
console.error('%s', ansi('error message').bright().red());
console.log('pi %d', ansi(3.14).blue().underline());
```

### ansi(value)

Wrap `value` in a chainable ANSI color instance. The `value` will be coerced
to a string when passed to a `console` function.

### colors

Array of color names.

### console

Map referencing the original `console` methods.
