var tty = require('tty');
var util = require('util');
var WritableStream = require('stream').Writable;

/**
 *  Write a writable stream.
 *
 *  @param options.stream A writable stream.
 *  @param options.callback A callback to invoke once the data is written.
 *  @param format The format string.
 *  @param ...  The format string arguments.
 */
module.exports = function write(options) {
  var proxy = options.proxy;
  var stream = options.stream;
  var isatty = options.isatty;
  if(stream instanceof WritableStream) {
    if(stream.fd == null) {
      throw new Error('Cannot write to stream, file descriptor not open');
    }
    var args = [
      {
        scope: util, method: util.format,
        tty: isatty(tty.isatty(stream.fd), options.mode)
      }
    ];
    args = args.concat([].slice.call(arguments, 1));
    var value = proxy.apply(null, args);
    stream.write(value, function() {
      if(typeof options.callback == 'function') options.callback(value);
    });
  }else{
    throw new Error('Stream option must be writable');
  }
}