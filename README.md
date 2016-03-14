## sockjs-rooms - allows to create a small pub/sub system

sockjs-rooms is a libray on top of SOCKJS that allow you create channels (rooms) over a single over a SockJS connection the concept of room applies due to the fact that all clients registered in some channel are able to get the message sent to this channel. This creates a simple pub/sub where clients are able to subscribe some channel and once anyone send a message to a channel the server broadcast this message to all client's registered on room (channel).

## Table of contents

- [Server](#server)
- [Node Client](#nodeclient)
- [Browser Client](#browserclient)
- [Protocol](#protocol)

## Server

### Simple server sample

´´´javascript
  var sockjs = require('sockjs');
var RoomServer = require('../lib/server.js');

var sockjs_opts = {
  sockjs_url: "http://cdn.sockjs.org/sockjs-0.3.min.js"
};
var service = sockjs.createServer(sockjs_opts);
var server = new RoomServer(service);

var red = server.registerChannel('red');
red.on('connection', function(conn) {
  conn.write('Red is connected');
  conn.on('data', function(data) {
    conn.write(data);
  });
});

var latency = server.registerChannel('latency');
latency.on('connection', function(conn) {
  conn.on('data', function(data) {
    conn.write(data);
  });
});
´´´
