'use strict';

var utils = require('../utils/writer.js');
var Default = require('../service/DefaultService');

module.exports.generateCSV = function generateCSV (req, res, next, body) {
  Default.generateCSV(req, res, next, body);
};
