## sockjs-rooms - small pub/sub system with sockjs

[![NPM](https://nodei.co/npm/sockjs-rooms.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/sockjs-rooms/)

sockjs-rooms is a libray on top of SOCKJS that allow you create channels (rooms) over a single over a SockJS connection the concept of room applies due to the fact that all clients registered in some channel are able to get the message sent to this channel. This creates a simple pub/sub where clients are able to subscribe some channel and once anyone send a message to a channel the server broadcast this message to all client's registered on room (channel).

This libray an this protocol was created on top of this libray [websocket-multiplex](https://github.com/sockjs/websocket-multiplex)

To learn more about the problem of multiplexing channels in a single connection please read more [here](https://www.rabbitmq.com/blog/2012/02/23/how-to-compose-apps-using-websockets/)

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

This example we connect register 4 channel, red, bob, carl and on channel for mesure latency
You can find full example under the folder example.

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

On the client side (browser) load library like that:

    <script src="http://cdn.sockjs.org/websocket-multiplex-0.1.js">
      </script>

Alternatively, if you're using SSL:

    <script src="https://d1fxtkz8shb9d2.cloudfront.net/websocket-multiplex-0.1.js">
      </script>

There is a full sample of .html client using this libray under the folder example, check the full example of this. This libray have the source of websocket-multiplex under the folder public. 



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
