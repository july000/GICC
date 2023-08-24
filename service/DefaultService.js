'use strict';
const {rsm_to_dataverse} = require('../transform_data_format')

/**
 * generate csv files
 *
 * body Event  (optional)
 * returns response
 **/

exports.generateCSV = function(req, res, next, body) {
  const eventlists = body.eventlists;
  convert(eventlists)
    .then(resMsg => {
      var results = {};
      results['eventResultLists'] = resMsg
      
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(JSON.stringify(results));
    })
    .catch(error => {
      console.error(error);
    });
}

async function convert(eventlists) {
  var promises = [];
  var resEventMsg = [];

  for (let i = 0; i < eventlists.length; i++) {
    promises.push(new Promise(async (resolve, reject) => {
      var event_id = eventlists[i].id;
      var mecEsn = eventlists[i].esn;
      // console.log("---- event_id : " + event_id);
      // console.log("---- mecEsn : " + mecEsn);
      var start_time = Date.parse(eventlists[i].create_time);
      var end_time = Date.parse(eventlists[i].end_time);
      var filepath = `/data/csv/output_${event_id}.csv`;

      try {
        const { resCode, resMsg, times, Obj } = await new Promise((resolve, reject) => {
          Get('RSM_Event', {"data.mecEsn":mecEsn, "data.timestamp": {$gte: start_time, $lte: end_time}}, 0, function (resCode, resMsg, times, Obj) {
            resolve({ resCode, resMsg, times, Obj });
          });
        });
        if (resCode !== 200) {
          console.error("[API service] GetOne event RSM file failed ---------------" + resCode + "-----------------");
          reject(new Error("GetOne event RSM file failed"));
          return;
        }
        var res = {};
        if (Obj && Obj.length > 0) {
          try {
            rsm_to_dataverse(Obj, filepath);
            res['isValid'] = true;
          }
          catch (error){
            console.log(`[API service] Geberate csv failed! Query condition : `+
                        `{"data.mecEsn":${mecEsn}, "data.timestamp":`+
                        `{$gte: ${start_time} = ${eventlists[i].create_time}, $lte: ${end_time} = ${eventlists[i].end_time}});`);
            res['isValid'] = false;
          }
        } else {
          console.log(`[API service] No documents matching the criteria were found! Query condition : `+
                      `{"data.mecEsn":${mecEsn}, "data.timestamp": `+
                      `{$gte: ${start_time} = ${eventlists[i].create_time}, $lte: ${end_time} = ${eventlists[i].end_time}}`);
          res['isValid'] = false;
        }
        res['csvUrl'] = filepath;
        res['eventID'] = event_id;
        resolve(res)
        resEventMsg.push(res);
      } catch (error) {
        console.error(error);
        reject(error);
      }
    }));
  }

  try {
    await Promise.all(promises);
    return resEventMsg;
  } catch (error) {
    console.error(error);
    throw error;
  }
}