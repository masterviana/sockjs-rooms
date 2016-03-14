var events = require('events'),
  stream = require('stream'),
  async = require('async'),
  debug = require('debug')('roomServer');


var elapsed_time = function(note){
      var precision = 3;
      var elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli
      console.log(process.hrtime(start)[0] + " s, " + elapsed.toFixed(precision) + " ms - " + note); 
      start = process.hrtime();
}

var RoomManager = function() {
  this.topics = {};
}

RoomManager.prototype.removeTopic = function(topic,connectionId){
  var self = this;
  debug("Unsubscribe client from topic "+ topic +' with connectionId ' + connectionId);
  if(this.topics[topic]){
    var channel = self.topics[topic][connectionId][0]
    channel.emit('close');
    delete self.topics[topic][connectionId];
  }
}

RoomManager.prototype.addTopic = function(channel) {
  debug('add new topic '+ channel.topic + ' with connectionId '+channel.conn.id);
  if (this.topics[channel.topic]) {
    if (this.topics[channel.topic][channel.conn.id]) {
       this.topics[channel.topic][channel.conn.id].push(channel);
    } else {
      this.topics[channel.topic][channel.conn.id] = [channel];
    }
  } else {
    var conn = {}
    conn[channel.conn.id] = [channel];
    this.topics[channel.topic] = conn;
  }
}
RoomManager.prototype.emitBroadcast = function(topic, payload) {
  var self = this;
  if (this.topics[topic]) {
    async.forEachOf(self.topics[topic], function(channel,key, callback) {
      channel[0].emit('data', payload);
      callback();
    }, function(err) {
    });
  }
}

var MultichannelServer = function(service) {
  var that = this;
  this.registered_channels = {};
  this.broadCast_ = new RoomManager();
  this.service = service;
  this.service.on('connection', function(conn) {
    debug('New client added to server ' + conn.id );
    var channels = {};
    conn.on('data', function(message) {
      debug('data arrive to server ' + message);
      var t = message.split(',');
      var type = t.shift(),
        topic = t.shift(),
        payload = t.join();
      if (!(topic in that.registered_channels)) {
        return;
      }
      if (topic in channels) {
        var sub = channels[topic];
        switch (type) {
          case 'uns':
            that.broadCast_.removeTopic(topic,conn.id);
            break;
          case 'msg':
            that.broadCast_.emitBroadcast(topic,payload);
            break;
        }
      } else {
        switch (type) {
          case 'sub':
            var sub = channels[topic] = new Channel(conn, topic, channels);
            that.broadCast_.addTopic(sub);
            that.registered_channels[topic].emit('connection', sub)
            break;
        }
      }
    });
    conn.on('close', function() {
      for (topic in channels) {
        channels[topic].emit('close');
      }
      channels = {};
    });
  });
};

MultichannelServer.prototype.registerChannel = function(name) {
  return this.registered_channels[escape(name)] = new events.EventEmitter();
};


exports = module.exports = MultichannelServer;

var Channel = function(conn, topic, channels) {
  this.conn = conn;
  this.topic = topic;
  this.channels = channels;
  stream.Stream.call(this);
};
Channel.prototype = new stream.Stream();

Channel.prototype.write = function(data) {
  this.conn.write('msg,' + this.topic + ',' + data);
};
Channel.prototype.end = function(data) {
  var that = this;
  if (data) this.write(data);
  if (this.topic in this.channels) {
    this.conn.write('uns,' + this.topic);
    delete this.channels[this.topic];
    process.nextTick(function() {
      that.emit('close');
    });
  }
};

Channel.prototype.destroy = Channel.prototype.destroySoon =
  function() {
    this.removeAllListeners();
    this.end();
  };
