var multichannelClient = require('sockjs-multichannel').client;

var multiClient = new multichannelClient("http://localhost:9999/multiplex");

var red = multiClient.channel("red");

function listeners(channel,name){
  channel.on("open",function(){
    console.log("OPEN Channel ",name);
  });
  channel.on("close",function(){
    console.log("CLOSE Channel ",name);
  });
  channel.on("message",function(message){
      console.log("DATA from  Channel ",name, " data : ",message);
  });
}

listeners(red,"red");
red.send("CLIENT 1 : hello there my dear!!");

setTimeout(function(){
  console.log("Client 1 will close the shop!! ");
  red.close();
},7000);

setInterval(function(){
  
},7000);
