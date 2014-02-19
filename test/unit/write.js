var expect = require('chai').expect;
var ttycolor = require('../..');

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
})
