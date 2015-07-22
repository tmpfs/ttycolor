var fs = require('fs');
var path = require('path');
var util = require('util');
var expect = require('chai').expect;

var ttycolor = require('../..');
var ansi = ttycolor.ansi;
var log = path.join(__dirname, '..', '..', 'log', 'stream.log');
var file = null;

describe('ttycolor:', function() {
  beforeEach(function(done) {
    file = fs.createWriteStream(log, {flags: 'w'});
    file.on('open', function(fd) {
      done();
    });
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
    ttycolor.write(
      {stream: file, callback: cb}, '%s', ansi(input).white.underline);
  });
})
