var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var util = require('util');
var expect = require('chai').expect;

var colors = {
  bin: path.normalize(path.join(__dirname, '..', '..', 'bin', 'colors')),
  log: path.normalize(path.join(__dirname, '..', '..', 'log', 'argv.log'))
}

describe('argv:', function() {
  function run(cmd, expected, done) {
    var ps = exec(cmd,
      function (error, stdout, stderr) {
        var out = stdout.toString(), err = stderr.toString();
        expect(error).to.be.null;
        expect(out).to.be.a('string').that.equals('');
        expect(err).to.be.a('string').that.equals('');
        var contents = fs.readFileSync(colors.log).toString();
        var lines = contents.split('\n');
        lines.pop();
        lines.forEach(function(line) {
          var re = /\u001b/g;
          var escaped = re.test(line);
          expect(line).to.be.a('string');
          expect(escaped).to.be.a('boolean').that.equals(expected);
        });
        done();
      }
    );
  }
  it('should write to file with no escape sequences (default: auto)',
    function(done) {
      var args = [];
      var cmd = util.format('%s > %s 2>&1',
        colors.bin + ' ' + args.join(' '), colors.log);
      run(cmd, false, done);
    }
  );
  it('should write to file with no escape sequences (--no-color)',
    function(done) {
      var args = ['--no-color'];
      var cmd = util.format('%s > %s 2>&1',
        colors.bin + ' ' + args.join(' '), colors.log);
      run(cmd, false, done);
    }
  );
  it('should write to file with no escape sequences (--color=never)',
    function(done) {
      var args = ['--color=never'];
      var cmd = util.format('%s > %s 2>&1',
        colors.bin + ' ' + args.join(' '), colors.log);
      run(cmd, false, done);
    }
  );
  it('should write to file with no escape sequences (--color never)',
    function(done) {
      var args = ['--color', 'never'];
      var cmd = util.format('%s > %s 2>&1',
        colors.bin + ' ' + args.join(' '), colors.log);
      run(cmd, false, done);
    }
  );
  it('should write to file with no escape sequences (--color=auto)',
    function(done) {
      var args = ['--color=auto'];
      var cmd = util.format('%s > %s 2>&1',
        colors.bin + ' ' + args.join(' '), colors.log);
      run(cmd, false, done);
    }
  );
  it('should write to file with no escape sequences (--color auto)',
    function(done) {
      var args = ['--color', 'auto'];
      var cmd = util.format('%s > %s 2>&1',
        colors.bin + ' ' + args.join(' '), colors.log);
      run(cmd, false, done);
    }
  );
  it('should write to file with escape sequences (--color)',
    function(done) {
      var args = ['--color'];
      var cmd = util.format('%s > %s 2>&1',
        colors.bin + ' ' + args.join(' '), colors.log);
      run(cmd, true, done);
    }
  );
  it('should write to file with escape sequences (--color=always)',
    function(done) {
      var args = ['--color=always'];
      var cmd = util.format('%s > %s 2>&1',
        colors.bin + ' ' + args.join(' '), colors.log);
      run(cmd, true, done);
    }
  );
  it('should write to file with escape sequences (--color always)',
    function(done) {
      var args = ['--color', 'always'];
      var cmd = util.format('%s > %s 2>&1',
        colors.bin + ' ' + args.join(' '), colors.log);
      run(cmd, true, done);
    }
  );
})
