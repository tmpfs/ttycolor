var always = 'always';
var auto = 'auto';
var never = 'never';
var modes = {};
modes[always] = always;
modes[auto] = auto;
modes[never] = never;

var color = '--color';
var nocolor = '--no-color';
var option = {always: color, never: nocolor};
var long = '--', short = '-';

module.exports = function parse(modes, option, argv) {
  option = option || {};
  option.always = option.always || color;
  option.never = option.never;
  var i, arg, value, keys = Object.keys(modes);
  var names = Object.keys(option), types = {}, flags = {}, re = /^-[^-]/;
  names.forEach(function(name) {
    if(option[name]) {
      types[name] = option[name].indexOf(long) == 0;
      if(!types[name]) flags[name] = true;
    }
  });

  // parse long options
  function opt(argv, arg, index, key) {
    var value = argv[index + 1], equals = arg.indexOf('=');
    if(equals > -1) value = arg.substr(equals + 1);
    if(value && (keys.indexOf(value) > -1)) {
      return value;
    }
    if(arg == option[key]) return modes[key];
    return false;
  }

  // parse flags
  function flag(argv, arg) {
    var value = false, arg = arg.replace(/^-/, ''), i, key;
    for(i = 0;i < names.length;i++) {
      key = names[i];
      if(!flags[key]) continue;
      var char = option[key].substr(1,1);
      if(!char) continue; // misconfigured short option
      if(arg.lastIndexOf(char) > -1) {
        return key;
      }
    }
    return value;
  }

  // default *auto* with no arguments
  if(!argv.length) {
    return auto;
  }else{
    for(i = 0;i < argv.length;i++) {
      arg = argv[i];
      // parse always as a long option
      if(arg.indexOf(option.always) == 0 && types.always) {
        if(value = opt(argv, arg, i, always)) {
          return value;
        }
      //
      }else if(re.test(arg)) {
        if(value = flag(argv, arg)) {
          return value;
        }
      // parse never option as a long option
      }else if(option.never && arg == option.never && types.never) {
        return never;
      }
    }
  }
  return auto;
}

module.exports.option = option;
module.exports.modes = modes;
module.exports.always = always;
module.exports.never = never;
module.exports.auto = auto;
