var expect = require('chai').expect
  , ttycolor = require('../..')
  , ansi = ttycolor.ansi
  , format = ttycolor.format;

describe('ttycolor:', function() {
  var underline = ttycolor.attributes.underline
    , red = ttycolor.background.red
    , white = ttycolor.foreground.white;

  it('should return escape sequence from stringify', function(done) {
    var input = 'value';
    var expected = '\u001b[1;37m' + input + '\u001b[0m';
    var result = ttycolor.stringify(
      input,
      ttycolor.foreground.white,
      ttycolor.attributes.bright);
    expect(result).to.be.a('string').that.equals(expected);
    done();
  });

  it('should handle format as ansi instance', function(done) {
    var input = 'value';
    var expected = '\u001b[1;37m' + input + '\u001b[0m';
    var result = format(ansi(input).white.bright);
    expect(result).to.be.a('string').that.equals(expected);
    done();
  });

  it('should handle format as ansi in parameter', function(done) {
    ttycolor.defaults();
    var input = 'value';
    // triggers code path, assertion very awkward
    console.log('my %s', ansi(input));
    ttycolor.revert();
    done();
  });

  it('should handle attribute only chains', function(done) {
    var def = ttycolor.attributes;
    var keys = Object.keys(def), v, result;
    keys.forEach(function(k) {
      v = def[k];
      var expected = '\u001b[' + v + ';'
        + ttycolor.foreground.normal + 'm' + k + '\u001b[0m';
      result = format('%s', ansi(k)[k]);
      expect(result).to.be.a('string').that.equals(expected);
    });
    done();
  });

  it('should handle multiple attribute only chains', function(done) {
    var input = 'value';
    var expected = '\u001b['
      + ttycolor.attributes.bright + ';'
      + ttycolor.foreground.normal + 'm' + '\u001b['
      + ttycolor.attributes.underline + ';'
      + ttycolor.foreground.normal + 'm' + input + '\u001b[0m' + '\u001b[0m';
    var result = format('%s', ansi(input).underline.bright);
    expect(result).to.be.a('string').that.equals(expected);
    done();
  });

  it('should handle color/attribute chains', function(done) {
    var input = 'value';
    var expected = '\u001b[1;37m' + input + '\u001b[0m';
    var result = format('%s', ansi(input).white.bright);
    expect(result).to.be.a('string').that.equals(expected);
    done();
  });

  it('should handle attribute/color chains', function(done) {
    var input = 'value';
    var expected = '\u001b[1;37m' + input + '\u001b[0m';
    var result = format('%s', ansi(input).bright.white);
    expect(result).to.be.a('string').that.equals(expected);
    done();
  });

  it('should handle color/multiple attribute chains', function(done) {
    var input = 'value';
    var expected = '\u001b[4;31m\u001b[1;31m' + input + '\u001b[0m\u001b[0m';
    var result = format('%s', ansi(input).red.bright.underline);
    expect(result).to.be.a('string').that.equals(expected);
    done();
  });

  it('should handle multiple attribute/color chains', function(done) {
    var input = 'value';
    var expected = '\u001b[4;31m\u001b[1;31m' + input + '\u001b[0m\u001b[0m';
    var result = format('%s', ansi(input).bright.underline.red);
    expect(result).to.be.a('string').that.equals(expected);
    done();
  });

  it('should handle color only chains', function(done) {
    var def = ttycolor.foreground;
    var keys = Object.keys(def), v, result;
    keys.forEach(function(k) {
      v = def[k];
      var expected = '\u001b[' + v + 'm' + k + '\u001b[0m';
      result = format('%s', ansi(k)[k]);
      expect(result).to.be.a('string').that.equals(expected);
    });
    done();
  });

  it('should handle background only chains', function(done) {
    var def = ttycolor.background;
    var keys = Object.keys(def), v, result;
    keys.forEach(function(k) {
      v = def[k];
      var expected = '\u001b[' + v + 'm' + k + '\u001b[0m';
      result = format('%s', ansi(k).bg[k]);
      expect(result).to.be.a('string').that.equals(expected);
    });
    done();
  });

  it('should handle foreground/background chains', function(done) {
    var fore = ttycolor.foreground;
    var back = ttycolor.background;
    var keys = Object.keys(fore), fg, bg, result;
    keys.forEach(function(k) {
      fg = fore[k];
      bg = back[k];
      var expected = '\u001b[' + bg + 'm' + '\u001b['
        + fg + 'm' + k + '\u001b[0m' + '\u001b[0m';
      result = format('%s', ansi(k)[k].bg[k]);
      expect(result).to.be.a('string').that.equals(expected);
    });
    done();
  });

  it('should handle background/foreground chains', function(done) {
    var fore = ttycolor.foreground;
    var back = ttycolor.background;
    var keys = Object.keys(fore), fg, bg, result;
    keys.forEach(function(k) {
      fg = fore[k];
      bg = back[k];
      var expected = '\u001b[' + fg + 'm' + '\u001b['
        + bg + 'm' + k + '\u001b[0m' + '\u001b[0m';
      result = format('%s', ansi(k).bg[k][k]);
      expect(result).to.be.a('string').that.equals(expected);
    });
    done();
  });

  it('should handle background/foreground/attribute chains', function(done) {
    var input = 'value';
    var chain = ansi(input).bg.red.white.underline;
    var expected = '\u001b[' + underline + ';'
      + white + 'm\u001b[' + red + 'm'
      + input + '\u001b[0m\u001b[0m';
    var result = format('%s', chain);
    expect(result).to.be.a('string').that.equals(expected);
    done();
  });

  it('should handle background/attribute/foreground chains', function(done) {
    var input = 'value';
    var chain = ansi('value').bg.red.underline.white;
    var expected = '\u001b[' + white
      + 'm\u001b[' + underline + ';' + red + 'm'
      + input + '\u001b[0m\u001b[0m';
    var result = format('%s', chain);
    expect(result).to.be.a('string').that.equals(expected);
    done();
  });

  it('should handle attribute/foreground/background chains', function(done) {
    var input = 'value';
    var chain = ansi('value').underline.white.bg.red;
    var expected = '\u001b[' + red
      + 'm\u001b[' + underline + ';' + white + 'm'
      + input + '\u001b[0m\u001b[0m';
    var result = format('%s', chain);
    expect(result).to.be.a('string').that.equals(expected);
    done();
  });

  it('should handle foreground/attribute/background chains', function(done) {
    var input = 'value';
    var chain = ansi('value').white.underline.bg.red;
    var expected = '\u001b[' + red
      + 'm\u001b[' + underline + ';' + white + 'm'
      + input + '\u001b[0m\u001b[0m';
    var result = format('%s', chain);
    expect(result).to.be.a('string').that.equals(expected);
    done();
  });

  it('should handle foreground/background/attribute chains', function(done) {
    var input = 'value';
    var chain = ansi('value').white.bg.red.underline;
    var expected = '\u001b[' + underline + ';' + red
      + 'm\u001b[' + white + 'm'
      + input + '\u001b[0m\u001b[0m';
    var result = format('%s', chain);
    expect(result).to.be.a('string').that.equals(expected);
    done();
  });

  it('should get empty start tag without tty', function(done) {
    var color = ansi('msg');
    expect(color.start()).to.eql('');
    done();
  });

  it('should ignore parent without key', function(done) {
    var expected = '\u001b[0m\u001b[40m';
    var color = ansi('msg').bright.red.bg.black;
    color.p.k = null;
    var start = color.start(true);
    expect(start).to.eql(expected);
    done();
  });

})
