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
    // eventlists.forEach(function(event){
      for (let i = 0; i < 5; i++){
      // console.log("---- request body event : "+event);
      // var event_id = event.id;
      // var event_startTime = event.startTime;
      // var event_endTime = event.endTime;
      promises.push(new Promise((resolve, reject) => {
      var filepath = './sample/output/result_'+i+'.csv'
      const pythonProcess = spawn('python3', ['./test.py', '--start-time', 1690335629000, '--end-time', 1690339571000, '--output-file',  filepath]);
      pythonProcess.stdout.on('data', (data) => {
        console.log(`Python stdout: ${data}`);
      });

      pythonProcess.stderr.on('data', (data) => {
        console.error(`Python stderr: ${data}`);
      });

      pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
      });
    }))
      // promises.push(new Promise((resolve, reject) => {
      //   Get('RSM_Event', {"data.timestamp": {$gte: event_startTime, $lte: event_endTime}}, 0, function (resCode, resMsg, times, Obj){
      //       console.log("------------------ generateCSV times: "+0);
      //           if (resCode !== 200) {
      //               console.error("GetOne event RSM file failed ---------------" + resCode + "-----------------");
      //               reject(resCode);
      //               return;
      //           }
      //           if (Obj) {
      //               console.log("===== type of obj : "+Object.keys(Obj));

      //               Obj.forEach(element => {

      //                   // const fileContents = JSON.parse(element.contents.toString());
      //                   // var tt =  JSON.parse(JSON.stringify(element));
      //                   console.log("in each file id : "+ typeof element);
      //                   // element.event_id = 0
                        
      //               });


      //           }

      //   })
      // }))

    
    };
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

