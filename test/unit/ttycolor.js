var fs = require('fs');
var expect = require('chai').expect;

var ttycolor = require('../..');

describe('ttycolor:', function() {
  it('should export properties', function(done) {
    expect(ttycolor.ansi).to.be.a('function');
    expect(ttycolor.attributes).to.be.an('object');
    expect(ttycolor.background).to.be.an('object');
    expect(ttycolor.colors).to.be.an('array');
    done();
  });
})
