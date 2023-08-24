var schedule = require('node-schedule');
var DeleteAll = require("../common/db_operation").DeleteAll
require("../common/db_operation").dbIni();
const getTrafficEvent = require('../common/Util').getTrafficEvent;


global.token = ''

function scheduleDeleteRSM() {
  var jobInstance = schedule.scheduleJob('*/5 * * * *', () => {
    console.log('------------------------------------ scheduleDeleteRSM is running at ' + new Date());
    var now = new Date();
    var deleteStartTimeDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes()-5, now.getSeconds());
    var deleteStartTimeDateString = deleteStartTimeDate.toISOString();
  
    var timezoneOffset = 8 * 60;
    var trafficEventStartTimeDate = new Date(now.getTime() + timezoneOffset * 60 * 1000 - 5 * 60 * 1000);
    var traficEventEndTimeDate = new Date(now.getTime() + timezoneOffset * 60 * 1000 );
  
    var traficEventStartTime = trafficEventStartTimeDate.toISOString();
    var traficEventEndTime = traficEventEndTimeDate.toISOString();

    getTrafficEvent(traficEventStartTime, traficEventEndTime)
      .then(data => {
        var trafficEventList = JSON.parse(data).rows;
        // console.log(`----------------------------- trafic condition : ${traficEventStartTime}, ${traficEventEndTime}`);
        // console.log(`----------------------------- trafic condition : ${Date.parse(startTime)}, ${Date.parse(endTime)}`);
        // console.log("----------------------------- trafficEventList.length : "+trafficEventList.length);
        var results = filterDataToRSMEvent(trafficEventList)
        // console.log("delete condition startTime " + Date.parse(deleteStartTimeDateString));
        DeleteAll('RSM', {"data.timestamp": {$lte:Date.parse(deleteStartTimeDateString)}});
      })
      .catch(error => {
        console.error(error);
      });
  });
}
module.exports.scheduleDeleteRSM = scheduleDeleteRSM

function filterDataToRSMEvent(trafficEventList) {
  if (trafficEventList.length === 0) {
    console.log("[schedule service] trafficEventList is empty. Processing...");
    return Promise.resolve();
  }

  var promises = [];
  for (let i = 0; i < trafficEventList.length; i++) {
    const event = trafficEventList[i];
    var start_time = Date.parse(event.trigger_time)
    var end_time = Date.parse(event.end_time)
    
    var enevt_id = event.id
    var mecEsn = event.esn

    promises.push(new Promise((resolve, reject) => {
      const query = {
        "data.mecEsn": mecEsn,
        "data.timestamp": {$gte:start_time, $lte:end_time}
      };
      // console.log("RSM query condition :" + JSON.stringify(query));
      Get('RSM', query, i, function (resCode, resMsg, times, Obj) {
        if (resCode !== 200) {
          console.error("[schedule service] GetOne event RSM file failed ---------------" + resCode + "-----------------");
          reject(resCode);
          return;
        }

        if (Obj) {
          // console.log("===== size : " + Obj.length);
          Obj.forEach(element => {
            element.event_id = enevt_id;
            PutOne('RSM_Event', {"data.timestamp": element.data.timestamp}, element, 0, function (resCode, resMsg, times) {
              if (resCode !== 200) {
                console.debug("[schedule service] post to RSM_Event failed!");
                return;
              }
              // console.log("post to RSM_Event -------- "+ resCode +" -----------------")
            });
          });
        }
      });
    }));
  }
  return Promise.all(promises);
}


function scheduleDeleteRSMEvent() {
  var jobInstance = schedule.scheduleJob('0 0 0 1 * *', () => {
    console.log('------------------------------------ scheduleDeleteRSMEvent is running at ' + new Date());
    var now = new Date();
    // now.setHours(now.getHours() + 8);
    var oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
    var startTime = oneMonthAgo.toISOString();
    // console.log("now : " + now);
    // console.log("startTIme : " + startTime + "   "+ Date.parse(startTime));
    DeleteAll('RSM_Event', { "data.timestamp": { $lte: Date.parse(startTime)}});
  });
}
module.exports.scheduleDeleteRSMEvent = scheduleDeleteRSMEvent

// let currentDate = new Date();
// currentDate.setDate(1);
// currentDate.setHours(0, 0, 0, 0);

// console.log("当前时间:", currentDate);
// scheduleDeleteRSMEvent();
// setInterval(() => {}, 1000);