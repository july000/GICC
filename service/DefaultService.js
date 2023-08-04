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
    console.log("------ request body ------: ");
    console.log("startTime: " + body.startTime);
    console.log("endTime: " + body.endTime);
    console.log("eventlists: " + body.eventlists);

    const eventlists = body.eventlists;
    runPythonScripts()
      .then(resMsg => {
        console.log("CSV generation successful.");
        console.log(resMsg);
        resolve(resMsg[Object.keys(resMsg)]); // Resolve the main promise with the result from runPythonScripts
      })
      .catch(error => {
        console.error("CSV generation failed.");
        console.error(error);
        reject(error); // Reject the main promise with the error
      });
  });
}

async function runPythonScripts() {
    var promises = [];
    var resMsg = [];

    for (let i = 0; i < 5; i++) {
      promises.push(new Promise((resolve, reject) => {
        var filepath = `/data/csv/output_${i}.csv`;
        var pythonProcess = spawn('python3', ['./test.py', '--start-time', 1690335629000, '--end-time', 1690339571000, '--output-file',  filepath]);

        pythonProcess.stdout.on('data', (data) => {
          if (data.toString().trim() === 'Finished') {
            var res = {};
            res['csvUrl'] = filepath;
            res['eventID'] = 0;
            resMsg.push(res);
            console.log("--------- add message to response" + resMsg);
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
    }

    console.log("------ end for loop");
    await Promise.all(promises);
    return resMsg;
}