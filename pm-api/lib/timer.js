/**
 * Created by fanlin on 2016/2/23.
 */
var util = require('util');
var eventEmitter = require('events').EventEmitter;

/**
 * 时钟Class
 * @param {Number} interval - 间隔
 */
function Timer(interval){
    eventEmitter.call(this);
    var self = this;
    var intervalObject = 0;
    self.interval = interval;
    self.start = function () {
      intervalObject = setInterval(function () {
          self.emit('tick');
      }, self.interval);
    };
    self.stop = function () {
      clearInterval(intervalObject);
    };
}

util.inherits(Timer,eventEmitter);
exports.Timer = Timer;
