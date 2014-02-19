var expect = require('chai').expect;
var ttycolor = require('../..');

describe('ttycolor:', function() {
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
})
