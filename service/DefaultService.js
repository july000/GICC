'use strict';

const { spawn } = require('child_process');
const { object } = require('joi');
// const currentWorkingDirectory = process.cwd();
// console.log(`Current working directory: ${currentWorkingDirectory}`);




/**
 * generate csv files
 *
 * body Event  (optional)
 * returns response
 **/
exports.generateCSV = function(body) {
  return new Promise(function(resolve, reject) {

    // var bod = JOSN.parse(body);

    console.log("------ request body ------  : ");
    console.log("------ request body ------  : " + body.startTime);
    console.log("------ request body ------  : " + body.endTime);
    console.log("------ request body ------  : " + body.eventlists);
    var eventlists = body.eventlists
    
    var promises = [];
    var resMsg = [];
    // eventlists.forEach(function(event){
      for (let i = 0; i < 5; i++){
      // console.log("---- request body event : "+event);
      // var event_id = event.id;
      // var event_startTime = event.startTime;
      // var event_endTime = event.endTime;
      promises.push(new Promise((resolve, reject) => {
      var filepath = '/data/csv/output_'+i+'.csv'
      const pythonProcess = spawn('python3', ['./test.py', '--start-time', 1690335629000, '--end-time', 1690339571000, '--output-file',  filepath]);
      pythonProcess.stdout.on('data', (data) => {
        // console.log(`Python stdout: ${data}`);
        if (data === 'Finished'){
          var res = {};
          res['csvUrl'] = filepath;
          res['evnetID'] = 0;
          resMsg.push(res);
          console.log("--------- add mesg to response");
        }

      });

      pythonProcess.stderr.on('data', (data) => {
        console.error(`Python stderr: ${data}`);
      });

      pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
      });
    }))
    
    };
    resolve(resMsg);

    // }
    // return Promise.all(promises);
      // PutOne('RSM_Event', {"data.timestamp": event.data.timestamp }, event, 0, function (resCode, resMsg, times) {
      //     if (resCode !== 200) {
      //         console.debug("post to RSM_FILTERED failed!");
      //         return;
      //     }
      //     // console.log("update to RSM_FILTERED ---------------" + resCode + "-----------------");
      //     resolve(resCode);
      // });
  // });

    // console.log("generateCSV body concent : "+body);

  });
}


function runPythonScripts() {
  return new Promise((resolve, reject) => {
    var promises = [];
    var resMsg = [];
    for (let i = 0; i < 5; i++) {
      promises.push(new Promise((resolve, reject) => {
        var filepath = `/data/csv/output_${i}.csv`;
        const pythonProcess = spawn('python3', ['./test.py', '--start-time', 1690335629000, '--end-time', 1690339571000, '--output-file',  filepath]);
        pythonProcess.stdout.on('data', (data) => {
          if (data.toString().trim() === 'Finished') {
            var res = {};
            res['csvUrl'] = filepath;
            res['evnetID'] = 0;
            resMsg.push(res);
            console.log("--------- add mesg to response");
            resolve();
          }
        });

        pythonProcess.stderr.on('data', (data) => {
          console.error(`Python stderr: ${data}`);
          reject(data);
        });

        pythonProcess.on('close', (code) => {
          console.log(`Python process exited with code ${code}`);
        });
      }));
    };

    Promise.all(promises).then(() => {
      resolve(resMsg);
    }).catch((error) => {
      reject(error);
    });
  });
}