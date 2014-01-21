var ansi = require('./ttycolor').ansi;

console.log('console.log: %s',
  ansi('white on black looks nice in the solarized color scheme')
    .white().bg().black());
console.log('console.log: sometimes just %s a word with a background is useful',
  ansi('highlighting')
    .black().bg().white());
console.log('console.log: %s values draw attention to the eye',
  ansi('bright').bright().white());
console.log('console.log: %s values draw attention to the eye',
  ansi('bright').underline().white());

//console.log('console.log: a %s string and a blue number %d',
  //ansi('white').white(), ansi(3.14).blue());
//console.info('console.info: a %s string and a green number %d',
  //ansi('cyan').cyan(), ansi(3.14).green());
//console.error('console.error: a %s string and a red number %d',
  //ansi('magenta').magenta(), ansi(3.14).red());
//console.warn('console.warn: a %s string and a black number %d',
  //ansi('yellow').yellow(), ansi(3.14).black());
