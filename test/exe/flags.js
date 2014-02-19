var path = require('path');
var util = require('util');
var run = require('../util/run');
var exe = path.normalize(
  path.join(__dirname, '..', '..', 'bin', 'argv', 'flags'));
var log = path.normalize(
  path.join(__dirname, '..', '..', 'log', 'argv.log'));

describe('argv flags:', function() {
  it('should write to file with no escape sequences (default: auto)',
    function(done) {
      var args = [];
      var cmd = util.format('%s > %s 2>&1',
        exe + ' ' + args.join(' '), log);
      run(cmd, false, done);
    }
  );
  it('should write to file with no escape sequences (-C)',
    function(done) {
      var args = ['-C'];
      var cmd = util.format('%s > %s 2>&1',
        exe + ' ' + args.join(' '), log);
      run(cmd, false, done);
    }
  );
  it('should write to file with escape sequences (-c)',
    function(done) {
      var args = ['-c'];
      var cmd = util.format('%s > %s 2>&1',
        exe + ' ' + args.join(' '), log);
      run(cmd, true, done);
    }
  );
  it('should write to file with escape sequences (-avfCc)',
    function(done) {
      var args = ['-avfCc'];
      var cmd = util.format('%s > %s 2>&1',
        exe + ' ' + args.join(' '), log);
      run(cmd, true, done);
    }
  );
})
