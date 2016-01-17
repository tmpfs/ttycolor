var expect = require('chai').expect
  , ttycolor = require('../..');

describe('ttycolor:', function() {

  it('should export properties', function(done) {
    expect(ttycolor.ansi).to.be.a('function');
    expect(ttycolor.attributes).to.be.an('object');
    expect(ttycolor.background).to.be.an('object');
    expect(ttycolor.colors).to.be.an('array');
    expect(ttycolor.console).to.be.an('object');
    expect(ttycolor.format).to.be.a('function');
    expect(ttycolor.foreground).to.be.an('object');
    expect(ttycolor.stringify).to.be.a('function');
    expect(ttycolor.keys).to.be.an('array');
    expect(ttycolor.parser).to.be.a('function');
    done();
  });

})
