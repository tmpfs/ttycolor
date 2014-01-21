require('./ttycolor');

console.log('console.log: a %s string and a blue number %d',
  console.white('white'), console.blue(3.14));
console.info('console.info: a %s string and a green number %d',
  console.cyan('cyan'), console.green(3.14));
console.error('console.error: a %s string and a red number %d',
  console.magenta('magenta'), console.red(3.14));
console.warn('console.warn: a %s string and a black number %d',
  console.yellow('yellow'), console.black(3.14));
