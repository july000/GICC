'use strict';

var utils = require('../utils/writer.js');
var Default = require('../service/DefaultService');

module.exports.generateSceneData = function generateSceneData (req, res, next, body) {
  Default.generateSceneData(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
