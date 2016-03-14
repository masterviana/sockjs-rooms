var debug = require('debug')('async_performance');
var async = require('async');

var limit = 500000;
var array ={}

// for(var i = 0 ; i < limit; i++ ){
//   array[i] = i;
// }


// debug("start sync for iteration");
// for(i in array){
//     var item = array[i]
// }
// debug("stop sync for iteration");
//
// debug("start async for iteration");
// async.each(array, function(i, callback) {
//     callback();
// }, function(err){
//     debug("stop async for iteration");
// });

var topics = {}
topics['red'] = {}
topics['red']['100'] = []
topics['red']['200'] = []
topics['red']['300'] = []
topics['red']['100'].push({id:1,mgs : "hello"})
topics['red']['200'].push({id:2,mgs : "hi"})
topics['red']['300'].push({id:3,mgs : "300 e tal"})

// delete topics['red']['300']

// for(item in topics['red']){
//   console.log(item)
// }

async.forEachOf(topics['red'], function(value,key,callback) {
    console.log(key)
    console.log(value)
    debug('======')

    callback();
}, function(err){
    debug("stop async for iteration");
});
