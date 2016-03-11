var events = require('events'),
  stream = require('stream'),
  async = require('async'),
  debug = require('debug')('roomServer');

var RoomManager = function() {
  this.topics = {};
}

RoomManager.prototype.removeTopic = function(topic){
  var self = this;
  debug("before remove topic ");
  debug(self.topics[topic]);
  debug('====');
  if(this.topics[topic]){
    async.each(self.topics[topic], function(ch, callback) {
      console.log(ch)
      console.log("++++++++")
      delete self.topics[ch.topic][ch.conn.id];
      // ch.emit('close');
      callback();
    }, function(err) {
      debug("after remove topic ");
      debug(self.topics);
      debug('====');
    });
  }
}

RoomManager.prototype.addTopic = function(channel) {
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
  debug("add new topic struck is now : ",channel.topic);
  debug(this.topics);
}
RoomManager.prototype.emitBroadcast = function(topic, payload) {
  var self = this;
  if (this.topics[topic]) {
    async.each(self.topics[topic], function(channel, callback) {
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
    debug('new connection ',conn.id );
    var channels = {};
    conn.on('data', function(message) {
      debug('data arrive to server ', message);
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
            debug("ONDATA [=] uns was called ");
            // delete channels[topic];
            // sub.emit('close');
            that.broadCast_.removeTopic(topic);
            break;
          case 'msg':
            that.broadCast_.emitBroadcast(topic,payload);
            // sub.emit('data', payload);
            break;
        }
      } else {
        switch (type) {
          case 'sub':
            debug('new channel subscribe ',topic );
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
    debug("CHANNEL was end");
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
