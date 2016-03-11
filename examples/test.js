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
topics['red']['100'].push({id:1,mgs : "hello"})
topics['red']['200'].push({id:2,mgs : "hi"})


debug("start async for iteration");
async.each(topics['red'], function(i, callback) {
    debug(i)
    debug('======')

    callback();
}, function(err){
    debug("stop async for iteration");
});
