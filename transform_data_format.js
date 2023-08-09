'use strict';
const jsonpath = require('jsonpath');
const _ = require('lodash');
const { DataFrame } = require('dataframe-js');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const Json2csvParser = require('json2csv').Parser;
const flat = require('flat');


var path = require('path');
var http = require('http');
var oas3Tools = require('oas3-tools');
var schedule = require('node-schedule');

require("./common/db_operation").dbIni();
const getTrafficEvent = require('./common/Util').getTrafficEvent;

var serverPort = 8080;
global.token = ''
var participantData = [];


const COLOR_MAP = {
  0: 'white',
  1: 'gray',
  3: 'yellow',
  4: 'pink',
  5: 'purple',
  6: 'green',
  7: 'blue',
  8: 'red',
  9: 'brown',
  10: 'orange',
  11: 'black'
};

const csvFields = [
  { id: 'vehicleColor', title: 'Color' },
  { id: 'heading', title: 'Yaw' },
  { id: 'size.length', title: 'Length' },
  { id: 'size.width', title: 'Width' },
  { id: 'size.height', title: 'Height' },
  { id: 'pos.lon', title: 'PositionX' },
  { id: 'pos.lat', title: 'PositionY' },
  { id: 'pos.ele', title: 'PositionZ' },
  { id: 'ptcID', title: 'ID' },
  { id: 'ptcType', title: 'Category' },
  { id: 'data.timestamp', title: 'Time' }
];

function getParticipantCount(data) {
  const participantCount = Object.keys(data).reduce((count, key) => {
    const regex = /^data\.rsms\.0\.participants\.(\d+)\..*$/;
    const match = key.match(regex);
    if (match) {
      const index = parseInt(match[1]);
      if (!isNaN(index) && index >= count) {
        return index + 1;
      }
    }
    return count;
  }, 0);

  return participantCount;
}

function extractParticipantData(data, participantCount, participantFields) {

  for (let i = 0; i < participantCount; i++) {
    const participantValues = {};
    for (const field of participantFields) {
      const key = `data.rsms.0.participants.${i}.${field.id}`;
      const value = data[key] || '';
      participantValues[field.id] = value;
    }
    participantValues['data.timestamp'] = data['data.timestamp']
    participantData.push(participantValues);

  }

  return participantData;
}

function transformData(flattenedData) {
  const transformedData = _.mapValues(flattenedData, (value, key) => {
    if (/^data\.(timestamp|rsms\.0\.participants)/.test(key)) {
      if (/.*\.speed$/.test(key)) {
        return value * 0.02;
      } else if (/.*\.heading$/.test(key)) {
        return value * 0.0125;
      } else if (key === 'data.timestamp') {
        return value / 1000;
      } else if (/\.size\.(length|width|height)$/.test(key)) {
        return value / 100;
      } else if (/.*\.vehicleColor$/.test(key)) {
        return COLOR_MAP[value] || value;
      }
    }
    return value;
  });

  return transformedData;
}

function writeParticipantDataToCsv(participantData, participantFields, outputPath) {
  const csvWriterOptions = {
    path: outputPath,
    header: participantFields
  };

  const csvWriterInstance = createCsvWriter(csvWriterOptions);

  return csvWriterInstance.writeRecords(participantData)
    .then(() => {
      console.log('CSV file has been updated with participant data successfully.');
    })
    .catch(err => {
      console.error('Error occurred while writing CSV file:', err);
    });
}

function rsm_to_dataverse(documents, outputFile){
  for (const document of documents) {
    const flattenedData = flat(document);
    // console.log(flattenedData)
    let transformedData = transformData(flattenedData);
    // console.log(transformedData);

    const participantCount = getParticipantCount(transformedData);
    console.log(participantCount);
    var extractedData = extractParticipantData(transformedData, participantCount, csvFields);
  }
  writeParticipantDataToCsv(extractedData, csvFields, outputFile);
}
  
Get('RSM_Event', {"data.mecEsn":"440113GXX000200000028", "data.timestamp": {$gte: 1691386604599.0, $lte: 1691386604999.0}}, 0, function (resCode, resMsg, times, Obj) {
  if (resCode !== 200) {
    console.error("GetOne event RSM file failed ---------------" + resCode + "-----------------");
    return;
  }
  if (Obj) {
    console.log("===== size : " +  Obj.length);
    const documents = [/* Array of JSON documents */];
    const normalizedDataFrame = rsm_to_dataverse(Obj, "/data/csv/output_test.csv");

  }
});