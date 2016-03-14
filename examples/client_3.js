var multichannelClient = require('sockjs-multichannel').client;

var multiClient = new multichannelClient("http://localhost:9999/multiplex");

var red = multiClient.channel("red");

function listeners(channel,name){
  channel.on("open",function(){
    console.log("OPEN Channel ",name);
  });
  channel.on("close",function(){
    console.log("CLOSE Channel 3 ",name);
  });
  channel.on("message",function(message){
      console.log("DATA from  Channel ",name, " data : ",message);
  });
}

listeners(red,"red");

setInterval(function(){
  red.send("Client 3 sent on message. OKAY?");

},1000);
