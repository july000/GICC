"use strict";

var Default = require("../service/DefaultService");

module.exports.generateCSV = function generateCSV(req, res, next, body) {
	Default.generateCSV(req, res, next, body);
};
