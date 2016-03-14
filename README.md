## sockjs-rooms - small pub/sub system with sockjs

[![NPM](https://nodei.co/npm/sockjs-rooms.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/sockjs-rooms/)

sockjs-rooms is a libray on top of SOCKJS that allow you create channels (rooms) over a single over a SockJS connection the concept of room applies due to the fact that all clients registered in some channel are able to get the message sent to this channel. This creates a simple pub/sub where clients are able to subscribe some channel and once anyone send a message to a channel the server broadcast this message to all client's registered on room (channel).

## Table of contents

- [Server](#server)
- [Node Client](#nodeclient)
- [Browser Client](#browserclient)
- [Protocol](#protocol)

## Server

### Simple server sample

```javascript
var sockjs = require('sockjs');
var RoomServer = require('sockjs-rooms');

var sockjs_opts = {
  sockjs_url: "http://cdn.sockjs.org/sockjs-0.3.min.js"
};
//create service with sockjs
var service = sockjs.createServer(sockjs_opts);
//suply sockjs service to room server 
var server = new RoomServer(service);

//register channel on server
var red = server.registerChannel('red');
red.on('connection', function(conn) {
  conn.write('Red is connected');
  conn.on('data', function(data) {
    conn.write(data);
  });
});

//create new channel only for reply message
var latency = server.registerChannel('latency');
latency.on('connection', function(conn) {
  conn.on('data', function(data) {
    conn.write(data);
  });
});
```

## Node Client

```javascript
var multichannelClient = require('sockjs-rooms').client;
//create sockjs-room client with server address
var multiClient = new multichannelClient("http://localhost:9999/multiplex");

//register client on channel latency
var latency = multiClient.channel("latency");

//listening message event for channel latency
latency.on("message",function(message){
  var startDate = +new Date();
  var backMessage = JSON.parse(message.data);
  if(backMessage){
    var endDate = +new Date();
    var diff = endDate - startDate;
    console.log("latency is ",diff,'ms');
  }
});

setInterval(function(){
  var start = +new Date();
  var message = { startTime : start }
  //sent message for client latency
  latency.send(JSON.stringify(message));
},500);

//register other channel on this client
var red = multiClient.channel("red");
red.on('open',function(){});
red.on('close',function(){});
red.on('message',function(message){
  console.log('data from channel red ',message)
});
```

## Browser Client


## Protocol
--------

The underlying protocol is quite simple. Each message is a string consisting of
three comma separated parts: _type_, _topic_ and _payload_. There are
three valid message types:

 * `sub` - expresses a will to subscribe to a given _topic_.
 * `msg` - a message with _payload_ is being sent on a _topic_.
 * `uns` - a will to unsubscribe from a _topic_.

Invalid messages like wrong unsubscriptions or publishes to a _topic_
to which a client was not subscribed to are simply ignored.

This protocol assumes that both parties are generally willing to
cooperate and that no party makes errors. All invalid
messages should be ignored.

It's important to notice that the namespace is shared between both
parties. It is not a good idea to use the same topic names on the
client and on the server side because both parties may unsubscribe
the other from a topic.


