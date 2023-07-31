'use strict';


/**
 * generate csv files
 *
 * body Event  (optional)
 * returns response
 **/
exports.generateCSV = function(body) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "csvUrl" : "csvUrl",
  "evnetID" : 0
}, {
  "csvUrl" : "csvUrl",
  "evnetID" : 0
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

