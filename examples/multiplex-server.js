var http = require('http');
var express = require('express');
var sockjs = require('sockjs');
// var multichannelServer = require('sockjs-multichannel').server;
var multichannelServer = require('../lib/server.js');


var sockjs_opts = {
  sockjs_url: "http://cdn.sockjs.org/sockjs-0.3.min.js"
};
var service = sockjs.createServer(sockjs_opts);

var multiplexer = new multichannelServer(service);

var red = multiplexer.registerChannel('red');
red.on('connection', function(conn) {
  conn.write('Red is conncted');
  conn.on('data', function(data) {
    conn.write(data);
  });
});

red.on('close',function(){
  console.log("sSERVER: red channel was closed!");
});
red.on('end',function(){
  console.log("sSERVER: red channel was end!");
});

setTimeout(function(){
  red.emit("close");
},3000);

// var bob = multiplexer.registerChannel('bob');
// bob.on('connection', function(conn) {
//   conn.write('bob is conncted');
//   conn.on('data', function(data) {
//     conn.write( data);
//   });
// });
//
// var carl = multiplexer.registerChannel('carl');
// carl.on('connection', function(conn) {
//   conn.write('bob is conncted');
//   conn.on('data', function(data) {
//     conn.write( data);
//   });
// });

var app = express();
var server = http.createServer(app);

service.installHandlers(server, {
  prefix: '/multiplex'
});
console.log(' [*] Listening on 0.0.0.0:9999');
server.listen(9999, '0.0.0.0');
app.get('/', function(req, res) {
  res.sendfile(__dirname + '/index.html');
});
