var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;

var ttycolor = require('../..');
var ansi = ttycolor.ansi;
var log = path.join(__dirname, '..', '..', 'log', 'out.log');
var file = null;

describe('ttycolor:', function() {
  beforeEach(function(done) {
    file = fs.createWriteStream(log, {flags: 'w'});
    file.on('open', function(fd) {
      done();
    });
  });
  it('should export properties', function(done) {
    expect(ttycolor.ansi).to.be.a('function');
    expect(ttycolor.attributes).to.be.an('object');
    expect(ttycolor.background).to.be.an('object');
    expect(ttycolor.colors).to.be.an('array');
    expect(ttycolor.console).to.be.an('object');
    expect(ttycolor.debug).to.be.a('function');
    expect(ttycolor.foreground).to.be.an('object');
    expect(ttycolor.stringify).to.be.a('function');
    done();
  });
  it('should write to stream', function(done) {
    var input = 'value';
    function cb(value) {
      expect(value).to.be.a('string').that.equals(input);
      var contents = fs.readFileSync(log);
      expect(contents.toString()).to.be.a('string').that.equals(input);
      file.end();
      done();
    }
    console.write({stream: file, callback: cb}, '%s', ansi(input).white().underline());
  });
  it('should return empty string with no arguments', function(done) {
    var result = ttycolor.debug();
    expect(result).to.be.a('string').that.equals('');
    done();
  });
  it('should not touch percent', function(done) {
    var result = ttycolor.debug('%', 'value');
    expect(result).to.be.a('string').that.equals('% value');
    result = ttycolor.debug('%d%', 100);
    expect(result).to.be.a('string').that.equals('100%');
    done();
  });
  it('should return vanilla string', function(done) {
    var input = 'value';
    var result = ttycolor.debug('%s', input);
    expect(result).to.be.a('string').that.equals(input);
    done();
  });
  it('should return vanilla number', function(done) {
    var input = 3.14;
    var result = ttycolor.debug('%s', input);
    expect(result).to.be.a('string').that.equals('' + input);
    done();
  });
  it('should return vanilla json', function(done) {
    var input = {message: 'json'};
    var result = ttycolor.debug('%j', input);
    expect(result).to.be.a('string').that.equals(JSON.stringify(input));
    done();
  });
  it('should handle extra format arguments', function(done) {
    var expected = 'foo:bar baz';
    var result = ttycolor.debug('%s:%s', 'foo', 'bar', 'baz');
    expect(result).to.be.a('string').that.equals(expected);
    done();
  });
  it('should handle too few format arguments', function(done) {
    var expected = 'foo:%s';
    var result = ttycolor.debug('%s:%s', 'foo');
    expect(result).to.be.a('string').that.equals(expected);
    done();
  });
  it('should handle non-string format', function(done) {
    var expected = '1 2 3';
    var result = ttycolor.debug(1, 2, 3);
    expect(result).to.be.a('string').that.equals(expected);
    done();
  });
  it('should handle undefined format', function(done) {
    var expected = 'undefined';
    var result = ttycolor.debug(undefined);
    expect(result).to.be.a('string').that.equals(expected);
    done();
  });
  it('should handle null format', function(done) {
    var expected = 'null';
    var result = ttycolor.debug(null);
    expect(result).to.be.a('string').that.equals(expected);
    done();
  });
  it('should handle true format', function(done) {
    var expected = 'true';
    var result = ttycolor.debug(true);
    expect(result).to.be.a('string').that.equals(expected);
    done();
  });
  it('should handle false format', function(done) {
    var expected = 'false';
    var result = ttycolor.debug(false);
    expect(result).to.be.a('string').that.equals(expected);
    done();
  });
  it('should handle object format', function(done) {
    var expected = '{}';
    var result = ttycolor.debug({});
    expect(result).to.be.a('string').that.equals(expected);
    done();
  });
  it('should handle array format', function(done) {
    var expected = '[]';
    var result = ttycolor.debug([]);
    expect(result).to.be.a('string').that.equals(expected);
    done();
  });
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
    var result = ttycolor.debug(ansi(input).white().bright());
    expect(result).to.be.a('string').that.equals(expected);
    done();
  });
  it('should handle attribute only chains', function(done) {
    var def = ttycolor.attributes;
    var keys = Object.keys(def), v, result;
    keys.forEach(function(k) {
      //console.log(k);
      v = def[k];
      expected = '\u001b[' + v + ';'
        + ttycolor.foreground.normal + 'm' + k + '\u001b[0m';
      result = ttycolor.debug('%s', ansi(k)[k]());
      expect(result).to.be.a('string').that.equals(expected);
    });
    done();
  });
  it('should handle color only chains', function(done) {
    var def = ttycolor.foreground;
    var keys = Object.keys(def), v, result;
    keys.forEach(function(k) {
      v = def[k];
      expected = '\u001b[' + v + 'm' + k + '\u001b[0m';
      result = ttycolor.debug('%s', ansi(k)[k]());
      expect(result).to.be.a('string').that.equals(expected);
    });
    done();
  });
  it('should handle background only chains', function(done) {
    var def = ttycolor.background;
    var keys = Object.keys(def), v, result;
    keys.forEach(function(k) {
      v = def[k];
      expected = '\u001b[' + v + 'm' + k + '\u001b[0m';
      result = ttycolor.debug('%s', ansi(k).bg()[k]());
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
      expected = '\u001b[' + bg + 'm' + '\u001b['
        + fg + 'm' + k + '\u001b[0m' + '\u001b[0m';
      result = ttycolor.debug('%s', ansi(k)[k]().bg()[k]());
      //console.dir(result);
      expect(result).to.be.a('string').that.equals(expected);
    });
    done();
  });
})
