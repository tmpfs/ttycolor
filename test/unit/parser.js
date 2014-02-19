var expect = require('chai').expect;
var ttycolor = require('../..');

describe('ttycolor:', function() {
  it('should use custom parser', function(done) {
    var parser = function(modes, option, argv) {
      expect(argv).to.eql(process.argv.slice(2));
      done();
    }
    ttycolor(parser);
  });
})
