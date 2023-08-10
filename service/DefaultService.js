'use strict';

// const { spawn } = require('child_process');
const {rsm2Dataverse} = require('../transform_data_format').rsm_to_dataverse

/**
 * generate csv files
 *
 * body Event  (optional)
 * returns response
 **/

exports.generateCSV = function(req, res, next, body) {
  // return new Promise(function(resolve, reject, res) {

    console.log("------ request body ------: ");
    console.log("startTime: " + body.startTime);
    console.log("endTime: " + body.endTime);
    console.log("eventlists: " + body.eventlists);


    const eventlists = body.eventlists;


    runPythonScripts(eventlists)
      .then(resMsg => {
        console.log("CSV generation successful.");
        console.log(resMsg);
        var results = {};
        results['application/json'] = resMsg
        // resolve(results[Object.keys(results)]); // Resolve the main promise with the result from runPythonScripts
        
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(JSON.stringify(results));
      })
      .catch(error => {
        console.error("CSV generation failed.");
        console.error(error);
        // reject(error); // Reject the main promise with the error
      });
  // });
}

async function runPythonScripts(eventlists) {
    var promises = [];
    var resMsg = [];

    for (let i = 0; i < eventlists.length; i++) {
      promises.push(new Promise((resolve, reject) => {
        var event_id = eventlists[i].id;
        var mecEsn = eventlists[i].esn;
        console.log("---- event_id : " + event_id);
        console.log("---- mecEsn : " + mecEsn);
        var start_time = Date.parse(eventlists[i].create_time);
        var end_time = Date.parse(eventlists[i].end_time);
        var filepath = `/data/csv/output_${event_id}.csv`;

        Get('RSM_Event', {"data.mecEsn":mecEsn, "data.timestamp": {$gte: start_time, $lte: end_time}}, 0, function (resCode, resMsg, times, Obj) {
          if (resCode !== 200) {
            console.error("GetOne event RSM file failed ---------------" + resCode + "-----------------");
            return;
          }
          if (Obj) {
            rsm2Dataverse(Obj, filepath);
          }
        });

        // var pythonProcess = spawn('python3', ['./test.py', '--mecEsn', mecEsn, '--start-time', start_time, '--end-time', end_time, '--output-file',  filepath]);

        // pythonProcess.stdout.on('data', (data) => {
        //   console.log(data.toString().trim());
        //   if (data.toString().trim() === 'Finished') {
        //     var res = {};
        //     res['csvUrl'] = filepath;
        //     res['eventID'] = 0;
        //     resMsg.push(res);
        //     console.log("--------- add message to response" + resMsg);
        //     resolve();
        //   }
        // });

        // pythonProcess.stderr.on('data', (data) => {
        //   console.error(`Python stderr: ${data}`);
        //   reject(data);
        // });

        // pythonProcess.on('close', (code) => {
        //   console.log(`Python process exited with code ${code}`);
        // });
      }));
    }

    
    await Promise.all(promises);
    return resMsg;
}