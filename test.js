var ansi = require('./ttycolor').ansi;

var fs = require('fs');
var tty = require('tty');


console.log('console.log: a %s string and a blue number %d',
  ansi('white').white().bg().black(), ansi(3.14).blue());

//console.log('console.log: a %s string and a blue number %d',
  //ansi('white').white(), ansi(3.14).blue());
//console.info('console.info: a %s string and a green number %d',
  //ansi('cyan').cyan(), ansi(3.14).green());
//console.error('console.error: a %s string and a red number %d',
  //ansi('magenta').magenta(), ansi(3.14).red());
//console.warn('console.warn: a %s string and a black number %d',
  //ansi('yellow').yellow(), ansi(3.14).black());
