'use strict';

const { spawn } = require('child_process');
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
    var promises = [];
    for (let i = 0; i < 5; i++){
        // const event = trafficEventList[i];
        // var trigger_time = Date.parse(event.trigger_time)
        // var end_time = event.end_time
        // var end_time = event.trigger_time// fix me
        
        // var enevt_id = event.id
        // var enevt_type = event.type
        // console.log("------------------ event id : "+event.id + " " + trigger_time + " i=" + i);
        promises.push(new Promise((resolve, reject) => {
            Get('RSM', {"data.timestamp": {$gte: 1690339379000, $lte: 1690339571000}}, i, function (resCode, resMsg, times, Obj){

                console.log("------------------ generateCSV times: "+i);

                // return new Promise(function(resolve, reject){
                    if (resCode !== 200) {
                        console.error("GetOne event RSM file failed ---------------" + resCode + "-----------------");
                        reject(resCode);
                        return;
                    }
                    if (Obj) {
                        console.log("===== generateCSV size : "+Obj.length);

                        const pythonProcess = spawn('python3', ['./test.py', 'run', Obj,  './sample/output/result.csv']);
                        pythonProcess.stdout.on('data', (data) => {
                          console.log(`Python stdout: ${data}`);
                        });

                        pythonProcess.stderr.on('data', (data) => {
                          console.error(`Python stderr: ${data}`);
                        });

                        pythonProcess.on('close', (code) => {
                          console.log(`Python process exited with code ${code}`);
                        });

                        Obj.forEach(element => {

                            // const fileContents = JSON.parse(element.contents.toString());
                            // var tt =  JSON.parse(JSON.stringify(element));
                            console.log("in each file id : "+ typeof element);
                            // element.event_id = 0
                            
                        });
                    }

            })
        }))
    }
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

    console.log("generateCSV body concent : "+body);


//     var examples = {};
//     examples['application/json'] = [ {
//   "csvUrl" : "csvUrl",
//   "evnetID" : 0
// }, {
//   "csvUrl" : "csvUrl",
//   "evnetID" : 0
// } ];
//     if (Object.keys(examples).length > 0) {
//       resolve(examples[Object.keys(examples)[0]]);
//     } else {
//       resolve();
//     }
  });
}

