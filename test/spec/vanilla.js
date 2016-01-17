var expect = require('chai').expect
  , format = require('../..').format;

describe('ttycolor:', function() {

  it('should return empty string with no arguments', function(done) {
    var result = format();
    expect(result).to.be.a('string').that.equals('');
    done();
  });

  it('should not touch percent', function(done) {
    var result = format('%', 'value');
    expect(result).to.be.a('string').that.equals('% value');
    result = format('%d%', 100);
    expect(result).to.be.a('string').that.equals('100%');
    done();
  });

  it('should return vanilla string', function(done) {
    var input = 'value';
    var result = format('%s', input);
    expect(result).to.be.a('string').that.equals(input);
    done();
  });

  it('should return vanilla number', function(done) {
    var input = 3.14;
    var result = format('%s', input);
    expect(result).to.be.a('string').that.equals('' + input);
    done();
  });

  it('should return vanilla json', function(done) {
    var input = {message: 'json'};
    var result = format('%j', input);
    expect(result).to.be.a('string').that.equals(JSON.stringify(input));
    done();
  });

  it('should handle extra format arguments', function(done) {
    var expected = 'foo:bar baz';
    var result = format('%s:%s', 'foo', 'bar', 'baz');
    expect(result).to.be.a('string').that.equals(expected);
    done();
  });

  it('should handle too few format arguments (%s)', function(done) {
    var expected = 'foo:%s';
    var result = format('%s:%s', 'foo');
    expect(result).to.be.a('string').that.equals(expected);
    done();
  });

  it('should handle too few format arguments (%j)', function(done) {
    var expected = 'foo:%j';
    var result = format('%s:%j', 'foo');
    expect(result).to.be.a('string').that.equals(expected);
    done();
  });

  it('should handle too few format arguments (%d)', function(done) {
    var expected = 'foo:%d';
    var result = format('%s:%d', 'foo');
    expect(result).to.be.a('string').that.equals(expected);
    done();
  });

  it('should handle non-string format', function(done) {
    var expected = '1 2 3';
    var result = format(1, 2, 3);
    expect(result).to.be.a('string').that.equals(expected);
    done();
  });

  it('should handle undefined format', function(done) {
    var expected = 'undefined';
    var result = format(undefined);
    expect(result).to.be.a('string').that.equals(expected);
    done();
  });

  it('should handle null format', function(done) {
    var expected = 'null';
    var result = format(null);
    expect(result).to.be.a('string').that.equals(expected);
    done();
  });

  it('should handle true format', function(done) {
    var expected = 'true';
    var result = format(true);
    expect(result).to.be.a('string').that.equals(expected);
    done();
  });

  it('should handle false format', function(done) {
    var expected = 'false';
    var result = format(false);
    expect(result).to.be.a('string').that.equals(expected);
    done();
  });

  it('should handle object format', function(done) {
    var expected = '{}';
    var result = format({});
    expect(result).to.be.a('string').that.equals(expected);
    done();
  });

  it('should handle array format', function(done) {
    var expected = '[]';
    var result = format([]);
    expect(result).to.be.a('string').that.equals(expected);
    done();
  });

})
