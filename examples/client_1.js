
var multichannelClient = require('sockjs-multichannel').client;
var multiClient = new multichannelClient("http://localhost:9999/multiplex");

var latency = multiClient.channel("latency");

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

var red = multiClient.channel("red");

function listeners(channel,name){
  channel.on("open",function(){
    console.log("OPEN Channel ",name);
  });
  channel.on("close",function(){
    console.log("CLOSE Channel ",name);
  });
  channel.on("message",function(message){
      console.log("DATA from  Channel ",name, " message  : ",message);
  });
}

listeners(red,"red");
red.send("CLIENT 1 : hello there my dear!!");
