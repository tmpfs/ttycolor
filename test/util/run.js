var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;
var log = path.normalize(path.join(__dirname, '..', '..', 'log', 'argv.log'))

module.exports = function run(cmd, expected, done) {
  exec(cmd,
    function (error, stdout, stderr) {
      var out = stdout.toString()
        , err = stderr.toString();
      expect(out).to.be.a('string').that.equals('');
      expect(err).to.be.a('string').that.equals('');
      var contents = fs.readFileSync(log).toString();
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
