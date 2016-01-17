var expect = require('chai').expect
  , ttycolor = require('../..')
  , parser = ttycolor.parser;

describe('ttycolor:', function() {

  it('should use custom parser', function(done) {
    var parser = function(modes, option, argv) {
      expect(argv).to.eql(process.argv.slice(2));
      done();
    }
    ttycolor(parser);
  });

  it('should handle zero arguments', function(done) {
    var res = parser();
    expect(res).to.eql(parser.auto);
    done();
  });

  it('should default to auto', function(done) {
    var args = ['--unknown'];
    var res = parser(parser.modes, null, args);
    expect(res).to.eql(parser.auto);
    done();
  });

  it('should handle --color', function(done) {
    var args = ['--color'];
    var res = parser(parser.modes, null, args);
    expect(res).to.eql(parser.always);
    done();
  });

  it('should handle --no-color', function(done) {
    var args = ['--no-color'];
    var res = parser(parser.modes, {never: parser.option.never}, args);
    expect(res).to.eql(parser.never);
    done();
  });

  it('should handle --color=always', function(done) {
    var args = ['--color=always'];
    var res = parser(parser.modes, null, args);
    expect(res).to.eql(parser.always);
    done();
  });

  it('should handle --color=never', function(done) {
    var args = ['--color=never'];
    var res = parser(parser.modes, null, args);
    expect(res).to.eql(parser.never);
    done();
  });

  it('should handle --color=auto', function(done) {
    var args = ['--color=auto'];
    var res = parser(parser.modes, null, args);
    expect(res).to.eql(parser.auto);
    done();
  });

  it('should handle --color always', function(done) {
    var args = ['--color', 'always'];
    var res = parser(parser.modes, null, args);
    expect(res).to.eql(parser.always);
    done();
  });

  it('should handle --color never', function(done) {
    var args = ['--color', 'never'];
    var res = parser(parser.modes, null, args);
    expect(res).to.eql(parser.never);
    done();
  });

  it('should handle --color auto', function(done) {
    var args = ['--color', 'auto'];
    var res = parser(parser.modes, null, args);
    expect(res).to.eql(parser.auto);
    done();
  });

  it('should handle --color=unknown', function(done) {
    var args = ['--color=unknown'];
    var res = parser(parser.modes, null, args);
    expect(res).to.eql(parser.auto);
    done();
  });

  it('should handle short option (-c)', function(done) {
    var args = ['-c'];
    var res = parser(parser.modes, {always: '-c'}, args);
    expect(res).to.eql(parser.always);
    done();
  });

  it('should handle short option flag override (-c -C)', function(done) {
    var args = ['-c', '-C'];
    var res = parser(parser.modes, {always: '-c', never: '-C'}, args);
    expect(res).to.eql(parser.never);
    done();
  });

  it('should handle short option flag expansion (-cvC)', function(done) {
    var args = ['-cvC'];
    var res = parser(parser.modes, {always: '-c', never: '-C'}, args);
    expect(res).to.eql(parser.never);
    done();
  });

})
