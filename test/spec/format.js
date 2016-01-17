var expect = require('chai').expect
  , ttycolor = require('../..')
  , ansi = ttycolor.ansi
  , format = ttycolor.format;

function tty() {
  return false;
}

describe('ttycolor:', function() {

  it('should handle format as ansi instance', function(done) {
    var expected = '\u001b[1;39mmsg\u001b[0m';
    var fmt = ansi('msg').bright;
    var res = format(fmt);
    expect(res).to.eql(expected);
    done();
  });

  it('should handle format as ansi with replacements', function(done) {
    var expected = '\u001b[1;39mmsg info\u001b[0m';
    var fmt = ansi('msg %s').bright;
    var res = format(fmt, 'info');
    expect(res).to.eql(expected);
    done();
  });

  it('should handle format as ansi with replacements (-tty)', function(done) {
    var expected = 'msg info';
    var fmt = ansi('msg %s').bright;
    var res = format(tty, fmt, 'info');
    expect(res).to.eql(expected);
    done();
  });

  it('should use custom tty test on format', function(done) {
    var expected = 'msg';
    var fmt = ansi('msg').bright;
    var res = format(tty, fmt);
    expect(res).to.eql(expected);
    done();
  });

  it('should replace %s (plain)', function(done) {
    var expected = 'str info';
    var fmt = 'str %s';
    var res = format(tty, fmt, 'info');
    expect(res).to.eql(expected);
    done();
  });

  it('should replace %d (plain)', function(done) {
    var expected = 'int 128';
    var fmt = 'int %d';
    var res = format(tty, fmt, 128);
    expect(res).to.eql(expected);
    done();
  });

  it('should replace %j (plain array)', function(done) {
    var expected = 'arr [1,2,3]';
    var fmt = 'arr %j';
    var res = format(tty, fmt, [1,2,3]);
    expect(res).to.eql(expected);
    done();
  });

  it('should replace %j (plain object)', function(done) {
    var obj = {foo: 'bar'};
    var expected = 'obj ' + JSON.stringify(obj);
    var fmt = 'obj %j';
    var res = format(tty, fmt, obj);
    expect(res).to.eql(expected);
    done();
  });

  it('should respect trailing % (plain)', function(done) {
    var expected = 'progress 50%';
    var fmt = 'progress %d%';
    var res = format(tty, fmt, 50);
    expect(res).to.eql(expected);
    done();
  });

  it('should mix plain and highlight parameters', function(done) {
    var expected = 'str: \u001b[1;39mstr\u001b[0m, int: '
    expected += '\u001b[1;39m128\u001b[0m, arr: \u001b[1;39m[1,2,3]\u001b[0m, '
    expected += 'obj: \u001b[1;39m{"foo":"bar"}\u001b[0m, str: str, int: 128, '
    expected += 'arr: [1,2,3], obj: {"foo":"bar"}';
    var fmt =
      'str: %s, int: %d, arr: %j, obj: %j, str: %s, int: %d, arr: %j, obj: %j';
    var res = format(fmt,
      ansi('str').bright, ansi(128).bright, ansi([1,2,3]).bright,
      ansi({foo: 'bar'}).bright,
      'str', 128, [1,2,3], {foo: 'bar'});
    expect(res).to.eql(expected);
    done();
  });

});
