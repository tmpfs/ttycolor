var expect = require('chai').expect
  , ttycolor = require('../..')
  , ansi = ttycolor.ansi;

describe('ttycolor:', function() {
  var method, error;

  beforeEach(function(done) {
    method = process.stderr.write;
    done();
  })

  afterEach(function(done) {
    process.stderr.write = method;
    done();
  })

  it('should initialize module on defaults', function(done) {
    var revert = ttycolor.defaults();
    expect(revert).to.be.a('function');
    revert();
    revert = ttycolor.defaults();
    expect(revert).to.be.a('function');
    revert();
    done();
  });

  it('should intialize module with zero arguments', function(done) {
    ttycolor();
    done();
  });

  it('should disable parser with false argument', function(done) {
    ttycolor(false);
    done();
  });

  it('should not re-initialize defaults', function(done) {
    var revert = ttycolor.defaults();
    expect(revert).to.be.a('function');
    expect(ttycolor.defaults()).to.eql(false);
    revert();
    revert = ttycolor.defaults();
    expect(revert).to.be.a('function');
    revert();
    done();
  });

  it('should write using console.error (zero arguments)', function(done) {
    var revert = ttycolor().defaults(null, null, null, true);
    process.stderr.write = function(){}
    error = console.error;
    console.error = function() {
      expect(arguments.length).to.eql(0);
      error.apply(null, arguments);
      revert();
      done();
    }
    console.error();
  });

  it('should write message using console.error', function(done) {
    var msg = 'mock %s message';
    var param = 'error';
    var revert = ttycolor().defaults(null, null, null, true);
    process.stderr.write = function(){}
    error = console.error;
    console.error = function() {
      expect(arguments[0]).to.eql(msg);
      expect(arguments[1]).to.eql(param);
      error(msg, param);
      revert();
      done();
    }
    console.error(msg, param);
  });

  it('should handle missing styles', function(done) {
    var styles = JSON.parse(JSON.stringify(ttycolor.defaultStyles));
    delete styles.error;
    var msg = 'mock %s message';
    var param = 'error';
    var revert = ttycolor().defaults(styles, null, null, true);
    process.stderr.write = function(){}
    error = console.error;
    console.error = function() {
      expect(arguments[0]).to.eql(msg);
      expect(arguments[1]).to.eql(param);
      error(msg, param);
      revert();
      done();
    }
    console.error(msg, param);
  });

  it('should handle invalid style property', function(done) {
    var styles = JSON.parse(JSON.stringify(ttycolor.defaultStyles));
    styles.error.format = null;
    styles.error.parameters = null;
    var msg = 'mock %s message';
    var param = 'error';
    var revert = ttycolor().defaults(styles, null, null, true);
    process.stderr.write = function(){}
    error = console.error;
    console.error = function() {
      expect(arguments[0]).to.eql(msg);
      expect(arguments[1]).to.eql(param);
      error(msg, param);
      revert();
      done();
    }
    console.error(msg, param);
  });

  it('should handle style replacement function at index', function(done) {
    var styles = JSON.parse(JSON.stringify(ttycolor.defaultStyles));
    styles.error.params = [
      function(arg, style, names, index) {
        expect(arg).to.eql(param);
        expect(style).to.eql(styles.error);
        expect(names).to.eql(['red', 'bright']);
        expect(index).to.eql(0);
        return ansi(arg).red;
      }
    ]
    var msg = 'mock %s message';
    var param = 'replacement error';
    var revert = ttycolor().defaults(styles, null, null, true);
    process.stderr.write = function(){}
    error = console.error;
    console.error = function() {
      expect(arguments[0]).to.eql(msg);
      expect(arguments[1]).to.eql(param);
      error(msg, param);
      revert();
      done();
    }
    console.error(msg, param);
  });

})
