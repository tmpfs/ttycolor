var always = 'always';
var auto = 'auto';
var never = 'never';

var defmodes = {};
defmodes[always] = always;
defmodes[auto] = auto;
defmodes[never] = never;

var color = '--color';
var nocolor = '--no-color';
var option = {always: color, never: nocolor};
var long = '--', short = '-';

module.exports = function parse(modes, option, argv) {
  option = option || {};
  option.always = option.always || color;
  option.never = option.never;
  modes = modes || defmodes;
  argv = argv || [];
  var i, arg, value, keys = Object.keys(modes);
  var names = Object.keys(option), types = {}, flags = {}, re = /^-[^-].*/;
  names.forEach(function(name) {
    if(option[name]) {
      types[name] = option[name].indexOf(long) === 0;
      if(!types[name]) {
        flags[name] = true;
      }
    }
  });

  // parse long options
  function opt(argv, arg, index, key) {
    var value = argv[index + 1], equals = arg.indexOf('=');
    if(equals > -1) {
      value = arg.substr(equals + 1);
    }
    if(value && ~keys.indexOf(value)) {
      return value;
    }
    if(arg === option[key]) {
      return modes[key];
    }
  }

  // parse flags
  function flag(argv, arg) {
    var value = false
      , i
      , key
      , opt
      , chars;
    arg = arg.replace(/^-/, '');
    //console.dir('flag: ' + arg);
    for(i = 0;i < names.length;i++) {
      key = names[i];
      if(!flags[key]) {
        continue;
      }
      opt = option[key].replace(/^-/, '');
      if(arg === opt) {
        return key;
      }
    }

    // handle flag expansion
    chars = arg.split('');
    while((arg = chars.shift())) {
      if((short + arg === option.always) && flags.always) {
        value = always;
      }else if((short + arg === option.never) && flags.never) {
        value = never;
      }
    }
    return value;
  }

  var res = auto;
  // default *auto* with no arguments
  if(argv.length) {
    for(i = 0;i < argv.length;i++) {
      arg = argv[i];
      // parse always as a long option
      if(arg.indexOf(option.always) === 0 && types.always) {
        if((value = opt(argv, arg, i, always))) {
          res = value;
        }
      //
      }else if(re.test(arg)) {
        if((value = flag(argv, arg))) {
          res = value;
        }
      // parse never option as a long option
      }else if(option.never && arg === option.never && types.never) {
        res = never;
      }
    }
  }
  return res;
}

module.exports.option = option;
module.exports.modes = defmodes;
module.exports.always = always;
module.exports.never = never;
module.exports.auto = auto;
