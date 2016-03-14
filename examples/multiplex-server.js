var http = require('http');
var express = require('express');
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

red.on('close',function(){
  console.log("sSERVER: red channel was closed!");
});
red.on('end',function(){
  console.log("sSERVER: red channel was end!");
});


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
