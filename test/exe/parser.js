var path = require('path');
var util = require('util');
var run = require('../util/run');
var exe = path.normalize(
  path.join(__dirname, '..', '..', 'bin', 'argv', 'parser'));
var log = path.normalize(
  path.join(__dirname, '..', '..', 'log', 'argv.log'))

describe('argv parser:', function() {
  it('should write to file with escape sequences (default: auto)',
    function(done) {
      var args = [];
      var cmd = util.format('%s > %s 2>&1',
        exe + ' ' + args.join(' '), log);
      run(cmd, true, done);
    }
  );
  it('should write to file with escape sequences (--no-color)',
    function(done) {
      var args = ['--no-color'];
      var cmd = util.format('%s > %s 2>&1',
        exe + ' ' + args.join(' '), log);
      run(cmd, true, done);
    }
  );
  it('should write to file with escape sequences (--color=never)',
    function(done) {
      var args = ['--color=never'];
      var cmd = util.format('%s > %s 2>&1',
        exe + ' ' + args.join(' '), log);
      run(cmd, true, done);
    }
  );
  it('should write to file with escape sequences (--color never)',
    function(done) {
      var args = ['--color', 'never'];
      var cmd = util.format('%s > %s 2>&1',
        exe + ' ' + args.join(' '), log);
      run(cmd, true, done);
    }
  );
  it('should write to file with escape sequences (--color=auto)',
    function(done) {
      var args = ['--color=auto'];
      var cmd = util.format('%s > %s 2>&1',
        exe + ' ' + args.join(' '), log);
      run(cmd, true, done);
    }
  );
  it('should write to file with escape sequences (--color auto)',
    function(done) {
      var args = ['--color', 'auto'];
      var cmd = util.format('%s > %s 2>&1',
        exe + ' ' + args.join(' '), log);
      run(cmd, true, done);
    }
  );
  it('should write to file with escape sequences (--color)',
    function(done) {
      var args = ['--color'];
      var cmd = util.format('%s > %s 2>&1',
        exe + ' ' + args.join(' '), log);
      run(cmd, true, done);
    }
  );
  it('should write to file with escape sequences (--color=always)',
    function(done) {
      var args = ['--color=always'];
      var cmd = util.format('%s > %s 2>&1',
        exe + ' ' + args.join(' '), log);
      run(cmd, true, done);
    }
  );
  it('should write to file with escape sequences (--color always)',
    function(done) {
      var args = ['--color', 'always'];
      var cmd = util.format('%s > %s 2>&1',
        exe + ' ' + args.join(' '), log);
      run(cmd, true, done);
    }
  );
})
