var fs = require('fs');
var path = require('path');
var tty = require('tty');
var expect = require('chai').expect;

var ttycolor = require('../..');
var outlog = path.join(__dirname, '..', '..', 'log', 'out.log');

console.log(outlog);

var stdout = {reader: null, writer: null}, stderr = {reader: null, writer: null};

describe('ttycolor:', function() {
  beforeEach(function(done) {
    stdout.writer = fs.createWriteStream(outlog, {flags: 'w'});
    stdout.writer.on('open', function(fd) {
      stdout.reader = fs.createReadStream(outlog, 'r');
      stdout.reader.on('open', function(fd) {
        done();
      });
    });
  });
  it('should export properties', function(done) {
    expect(ttycolor.ansi).to.be.a('function');
    expect(ttycolor.attributes).to.be.an('object');
    expect(ttycolor.background).to.be.an('object');
    expect(ttycolor.colors).to.be.an('array');
    expect(ttycolor.console).to.be.an('object');
    expect(ttycolor.foreground).to.be.an('object');
    expect(ttycolor.stringify).to.be.a('function');
    done();
  });

  it('should print empty string with no arguments', function(done) {
    function cb(value) {
      expect(value).to.be.a('string').that.equals('');
      stdout.writer.end();
      done();
    }
    console.write({stream: stdout.writer, callback: cb});
  });
  it('should print value', function(done) {
    var input = 'value';
    function cb(value) {
      expect(value).to.be.a('string').that.equals(input);
      stdout.writer.end();
      done();
    }
    console.write({stream: stdout.writer, callback: cb}, input);
  });
  it('should print escaped', function(done) {
    var fd = process.stdout.fd;
    process.stdout.fd = stdout.writer.fd;
    var input = 'my value';
    function cb(value) {
      expect(value).to.be.a('string').that.equals(input);
      process.stdout.fd = fd;
      stdout.writer.end();
      done();
    }
    console.write({stream: stdout.writer, callback: cb}, input);
  });
})
