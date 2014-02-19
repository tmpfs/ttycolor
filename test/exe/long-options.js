var path = require('path');
var util = require('util');
var run = require('../util/run');
var exe = path.normalize(
  path.join(__dirname, '..', '..', 'bin', 'argv', 'long'));
var log = path.normalize(
  path.join(__dirname, '..', '..', 'log', 'argv.log'));

describe('argv custom long options:', function() {
  it('should write to file with no escape sequences (default: auto)',
    function(done) {
      var args = [];
      var cmd = util.format('%s > %s 2>&1',
        exe + ' ' + args.join(' '), log);
      run(cmd, false, done);
    }
  );
  it('should write to file with no escape sequences (--no-colorize)',
    function(done) {
      var args = ['--no-colorize'];
      var cmd = util.format('%s > %s 2>&1',
        exe + ' ' + args.join(' '), log);
      run(cmd, false, done);
    }
  );
  it('should write to file with no escape sequences (--colorize=never)',
    function(done) {
      var args = ['--colorize=never'];
      var cmd = util.format('%s > %s 2>&1',
        exe + ' ' + args.join(' '), log);
      run(cmd, false, done);
    }
  );
  it('should write to file with no escape sequences (--colorize never)',
    function(done) {
      var args = ['--colorize', 'never'];
      var cmd = util.format('%s > %s 2>&1',
        exe + ' ' + args.join(' '), log);
      run(cmd, false, done);
    }
  );
  it('should write to file with no escape sequences (--colorize=auto)',
    function(done) {
      var args = ['--colorize=auto'];
      var cmd = util.format('%s > %s 2>&1',
        exe + ' ' + args.join(' '), log);
      run(cmd, false, done);
    }
  );
  it('should write to file with no escape sequences (--colorize auto)',
    function(done) {
      var args = ['--colorize', 'auto'];
      var cmd = util.format('%s > %s 2>&1',
        exe + ' ' + args.join(' '), log);
      run(cmd, false, done);
    }
  );
  it('should write to file with escape sequences (--colorize)',
    function(done) {
      var args = ['--colorize'];
      var cmd = util.format('%s > %s 2>&1',
        exe + ' ' + args.join(' '), log);
      run(cmd, true, done);
    }
  );
  it('should write to file with escape sequences (--colorize=always)',
    function(done) {
      var args = ['--colorize=always'];
      var cmd = util.format('%s > %s 2>&1',
        exe + ' ' + args.join(' '), log);
      run(cmd, true, done);
    }
  );
  it('should write to file with escape sequences (--colorize always)',
    function(done) {
      var args = ['--colorize', 'always'];
      var cmd = util.format('%s > %s 2>&1',
        exe + ' ' + args.join(' '), log);
      run(cmd, true, done);
    }
  );
})
