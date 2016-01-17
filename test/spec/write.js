var expect = require('chai').expect
  , ttycolor = require('../..')
  , ansi = ttycolor.ansi;

describe('ttycolor:', function() {
  var method;

  beforeEach(function(done) {
    method = process.stderr.write;
    done();
  })

  afterEach(function(done) {
    process.stderr.write = method;
    done();
  })

  it('should throw error on invalid stream', function(done) {
    ttycolor();
    function fn() {
      ttycolor.write({stream : {}});
    }
    expect(fn).throws(TypeError);
    done();
  });

  it('should throw error on invalid fd', function(done) {
    ttycolor();
    function fn() {
      ttycolor.write({stream : { write: function(){} }});
    }
    expect(fn).throws(TypeError);
    done();
  });

  it('should write to stream (no callback)', function(done) {
    process.stderr.write = function(value, callback) {
      callback();
    }
    ttycolor();
    var opts = {
      stream: process.stderr
    }
    ttycolor.write(opts, 'mock %s message', 'stream');
    done();
  });

  it('should write to stream (stderr)', function(done) {
    var expected = 'mock stream message';
    process.stderr.write = function(value, callback) {
      callback();
    }
    ttycolor();
    var opts = {
      stream: process.stderr,
      callback: function(value) {
        expect(value).to.eql(expected);
        done();
      }
    }
    ttycolor.write(opts, 'mock %s message', 'stream');
  });

  it('should write to stream (--color)', function(done) {
    var expected = 'mock \u001b[1;39mstream\u001b[0m message';
    process.stderr.write = function(value, callback) {
      callback();
    }
    process.argv.push('--color');
    ttycolor(null, null, true);
    var opts = {
      stream: process.stderr,
      callback: function(value) {
        expect(value).to.eql(expected);
        process.argv.pop();
        done();
      }
    }
    ttycolor.write(opts, 'mock %s message', ansi('stream').bright);
  });

  it('should write to stream (--no-color)', function(done) {
    var expected = 'mock stream message';
    process.stderr.write = function(value, callback) {
      callback();
    }
    process.argv.push('--no-color');
    ttycolor(null, null, true);
    var opts = {
      stream: process.stderr,
      callback: function(value) {
        expect(value).to.eql(expected);
        process.argv.pop();
        done();
      }
    }
    ttycolor.write(opts, 'mock %s message', ansi('stream').bright);
  });

})
