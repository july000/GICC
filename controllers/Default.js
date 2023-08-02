'use strict';

var utils = require('../utils/writer.js');
var Default = require('../service/DefaultService');

module.exports.generateCSV = function generateCSV (req, res, next, body) {
  Default.generateCSV(body)
    .then(response=> {
      console.log("-------- response : " + response)
      res.setHeader('Content-Type', 'application/json');
      // res.statusCode = resCode;
      res.end(JSON.stringify(response));
      // utils.writeJson(res, response);
    })
    .catch(function (response) {
      // res.end(response);
      // utils.writeJson(res, response);
    });
};
