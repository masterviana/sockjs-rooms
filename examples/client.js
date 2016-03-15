var room = require('sockjs-rooms').client;
var roomClient = new room("http://localhost:9999/multiplex");

var latency = roomClient.channel("latency");
latency.on("message",function(message){
  var startDate = +new Date();
  var backMessage = JSON.parse(message.data);
  if(backMessage && backMessage ){
    var endDate = +new Date();
    var diff = endDate - startDate;
    console.log("latency is ",diff,'ms');
  }
});

setInterval(function(){
  var start = +new Date();
  var message = { type:1, startTime : start }
  latency.send(JSON.stringify(message));
},500);

var red = roomClient.channel("red");
red.on('open',function(){});
red.on('close',function(){});
red.on('message',function(message){
  console.log('channel:Red data : ',message)
});

setInterval(function(){
  red.send("send message to red from nodejs client");
},900);

var bob = roomClient.channel("bob");
bob.on('open',function(){});
bob.on('close',function(){});
bob.on('message',function(message){
  console.log('channel:Bob data : ',message)
});

setInterval(function(){
  bob.send("send message to bob from nodejs client");
},600);

var carl = roomClient.channel("carl");
carl.on('open',function(){});
carl.on('close',function(){});
carl.on('message',function(message){
  console.log('channel:carl data : ',message)
});

setInterval(function(){
  carl.send("send message to bob from nodejs client");
},500);
