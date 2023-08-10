'use strict';
const jsonpath = require('jsonpath');
const _ = require('lodash');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const flat = require('flat');
const coordtransform = require('coordtransform');
const radians = require('degrees-radians');

var path = require('path');
var http = require('http');
var oas3Tools = require('oas3-tools');
var schedule = require('node-schedule');

require("./common/db_operation").dbIni();
const getTrafficEvent = require('./common/Util').getTrafficEvent;

var serverPort = 8080;
global.token = ''
var participantData = [];

function latLonToENU(lat1, lon1, lat2, lon2, callback) {
  try {
    import('geodesy/latlon-ellipsoidal-vincenty.js')
      .then(module => {
        const LatLon = module.default;

        // Create LatLon objects
        const p1 = new LatLon(lat1, lon1);
        const p2 = new LatLon(lat2, lon2);

        // Convert to ECEF
        const referenceEcef = p1.toCartesian();
        const pointEcef = p2.toCartesian();

        // Compute diffs in ECEF
        const deltaLat = pointEcef.x - referenceEcef.x;
        const deltaLon = pointEcef.y - referenceEcef.y;
        const deltaHeight = pointEcef.z - referenceEcef.z;

        // Transformation params
        const sinLat1 = Math.sin(radians(p1.lat));
        const cosLat1 = Math.cos(radians(p1.lat));
        const sinLon1 = Math.sin(radians(p1.lon));
        const cosLon1 = Math.cos(radians(p1.lon));

        // Transform ECEF diffs to ENU
        const east = -sinLon1 * deltaLat + cosLon1 * deltaLon;
        const north = -sinLat1 * cosLon1 * deltaLat - sinLat1 * sinLon1 * deltaLon + cosLat1 * deltaHeight;
        const up = cosLat1 * cosLon1 * deltaLat + cosLat1 * sinLon1 * deltaLon + sinLat1 * deltaHeight;

        callback(null, { east, north, up });
      })
      .catch(err => callback(err, null));
  } catch (error) {
    callback(error, null);
  }
}

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
  { id: 'pos.lat', title: 'PositionX' },
  { id: 'pos.lon', title: 'PositionY' },
  { id: 'pos.ele', title: 'PositionZ' },
  { id: 'ptcID', title: 'ID' },
  { id: 'ptcType', title: 'Category' },
  { id: 'data.timestamp', title: 'Time' }
];

// 将 GPS 坐标转换为火星坐标系坐标
function convertToGCJ02(latitude, longitude) {
  const result = coordtransform.wgs84togcj02(longitude, latitude);
  return {
    latitude: result[1],
    longitude: result[0]
  };
}

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

async function writeParticipantDataToCsv(participantData, participantFields, outputPath) {

  const updatedData = await Promise.all(participantData.map(async (data) => {
    const gcjCoords = convertToGCJ02(data['pos.lat'], data['pos.lon']);
    const referenceLat = 23.023899623618;
    const referenceLon = 113.488177461743;
    try {
      const enuCoords = await new Promise((resolve, reject) => {
        latLonToENU(gcjCoords.latitude, gcjCoords.longitude, referenceLat, referenceLon, (error, enuCoords) => {
          if (error) {
            reject(error);
          } else {
            resolve(enuCoords);
          }
        });
      });

      data['pos.lat'] = enuCoords.east;
      data['pos.lon'] = enuCoords.north;
      data['pos.ele'] = enuCoords.up;
    } catch (error) {
      console.error('Error occurred while computing ENU:', error);
    }

    return data;
  }));
  writeDataToCsv(updatedData, participantFields, outputPath);
}


function writeDataToCsv(participantData, participantFields, outputPath){
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
    let transformedData = transformData(flattenedData);

    const participantCount = getParticipantCount(transformedData);
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
    const documents = [/* Array of JSON documents */];
    const normalizedDataFrame = rsm_to_dataverse(Obj, "/data/csv/output_test222.csv");
  }
});