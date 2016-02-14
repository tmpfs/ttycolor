var expect = require('chai').expect
  , ttycolor = require('../..');

describe('ttycolor:', function() {

  afterEach(function(done) {
    ttycolor.stderr(false);
    done();
  })

  it('should use error stream', function(done) {
    expect(ttycolor.stderr()).to.eql(false);
    ttycolor.stderr(true);
    expect(ttycolor.stderr()).to.eql(true);
    ttycolor.revert();
    done();
  });

  it('should use error stream calling defaults', function(done) {
    expect(ttycolor.stderr()).to.eql(false);
    ttycolor.defaults(ttycolor.defaultStyles, true);
    expect(ttycolor.stderr()).to.eql(true);
    ttycolor.revert();
    done();
  });

})
