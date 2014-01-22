var fs = require('fs');
var path = require('path');
var tty = require('tty');
var expect = require('chai').expect;

var ttycolor = require('../..');
var outlog = path.join(__dirname, '..', '..', 'log', 'out.log');
var errlog = path.join(__dirname, '..', '..', 'log', 'err.log');

var stdout = {reader: null, writer: null},
  stderr = {reader: null, writer: null};

describe('ttycolor:', function() {
  beforeEach(function(done) {
    stdout.writer = fs.createWriteStream(outlog, {flags: 'w'});
    stdout.writer.on('open', function(fd) {
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
      stdout.writer.end();
      done();
    }
    console.write({stream: stdout.writer, callback: cb}, input);
  });
  it('should return empty string with no arguments', function(done) {
    var result = ttycolor.debug();
    expect(result).to.be.a('string').that.equals('');
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
  it('should return escape sequence', function(done) {
    var input = 'value';
    var expected = '\u001b[1;37m' + input + '\u001b[0m';
    var result = ttycolor.stringify(
      input,
      ttycolor.foreground.white,
      ttycolor.attributes.bright);
      expect(result).to.be.a('string').that.equals(expected);
    done();
  });

})
