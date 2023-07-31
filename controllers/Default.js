'use strict';

var utils = require('../utils/writer.js');
var Default = require('../service/DefaultService');

module.exports.generateCSV = function generateCSV (req, res, next, body) {
  Default.generateCSV(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
