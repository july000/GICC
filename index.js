'use strict';

var path = require('path');
var http = require('http');
var oas3Tools = require('oas3-tools');
var schedule = require('node-schedule');

require("./common/db_operation").dbIni();
const getTrafficEvent = require('./common/Util').getTrafficEvent;

var serverPort = 8080;
global.token = ''

var WebSocketClient = require('websocket').client;
var client = new WebSocketClient();

client.on('connectFailed', function(error) {
    console.log('Connect Failed: ' + error.toString());
});

client.on('connect', function(connection) {
  console.log('WebSocket Client Connected');

  connection.on('error', function(error) {
      console.log("Connection Error: " + error.toString());
  });

  connection.on('close', function() {
      console.log('echo-protocol Connection Closed');
  });

  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      var mess = JSON.parse(message.utf8Data);
      if (mess.type !== 14){
        return
      }
      var obj = new RSMDataObj(mess);
      PostOne('RSM', obj, 0, function(resCode, resMsg, times) {
        if (resCode !== 200) {
          console.debug("Save file to RSM collection failed!");
          return;
        } 
        console.log("Save file to RSM collection ---------------" + resCode + "-----------------");
      });
    }
  });
    
  function sendNumber() {
    if (connection.connected) {
      var number = Math.round(Math.random() * 0xFFFFFF);
      connection.sendUTF(number.toString());
      setTimeout(sendNumber, 1000);
    }
  }
  sendNumber();
});

var jobInstance = schedule.scheduleJob('*/2 * * * *', () => {
  console.log('------------------------------------The job is running at ' + new Date());
  var now = new Date();
  var timezoneOffset = 8 * 60;
  var startTimeDate = new Date(now.getTime() + timezoneOffset * 60 * 1000 - 10 * 60 * 1000); // 获取 startTime 的前五分钟
  var endTimeDate = new Date(now.getTime() + timezoneOffset * 60 * 1000 ); // 获取 startTime 的前五分钟

  var startTime = startTimeDate.toISOString();
  var endTime = endTimeDate.toISOString();

  // console.log("------- startTime endTime : " +startTime + "   " +endTime);

  getTrafficEvent(startTime, endTime)
    .then(data => {
        // console.log(data);
        var trafficEventList = JSON.parse(data).rows;
        console.log("----------------------------- trafficEventList.length : "+trafficEventList.length);
        getData(trafficEventList)
            .then(function(results) {
              console.log('操作完成，结果为：', results);
              // Delete the original data
              DeleteAll('RSM', {"data.timestamp": {$lte: startTime}}, 0, function (resCode, resMsg, times) {
                if (resCode !== 200) {
                  console.debug("delete file from RSM failed!");
                  return;
                }
                console.log("delete file from RSM success! ---------------" + resCode + "-----------------");
              });
            })
            .catch(function(error) {
              console.log('操作失败，错误信息为：', error);
            });
    }).catch(error => {
      console.error(error);
    });
});


function getData(trafficEventList) {
  var promises = [];
  for (let i = 0; i < trafficEventList.length; i++) {
    const event = trafficEventList[i];
    var trigger_time = Date.parse(event.trigger_time)
    var start_time = Date.parse(event.trigger_time)
    var end_time = Date.parse(event.end_time)
    
    var enevt_id = event.id
    var enevt_type = event.type
    // console.log("------------------ event id : "+event.id + " " + trigger_time + " i=" + i);

    promises.push(new Promise((resolve, reject) => {
      const query = {
        "mecEsn": event.esn,
        "data.timestamp": {$gte: start_time, $lte: end_time}
      };
      Get('RSM', query, i, function (resCode, resMsg, times, Obj) {
        if (resCode !== 200) {
          console.error("GetOne event RSM file failed ---------------" + resCode + "-----------------");
          reject(resCode);
          return;
        }

        if (Obj) {
          console.log("===== size : " + Obj.length);
          Obj.forEach(element => {
            element.event_id = enevt_id;
            PutOne('RSM_Event', {"data.timestamp": element.data.timestamp}, element, 0, function (resCode, resMsg, times) {
              if (resCode !== 200) {
                console.debug("post to RSM_FILTERED failed!");
                return;
              }
            });
            
          });
        }
      });
    }));
  }

  return Promise.all(promises);
}


// swaggerRouter configuration
var options = {
    routing: {
        controllers: path.join(__dirname, './controllers')
    },
  };

var expressAppConfig = oas3Tools.expressAppConfig(path.join(__dirname, 'api/openapi.yaml'), options);
var app = expressAppConfig.getApp();
client.connect('ws://36.138.2.41:9873/api/websocket/connectServer/sim-gicc'); //, 'echo-protocol');

// Initialize the Swagger middleware
http.createServer(app).listen(serverPort, function () {
    console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
    console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
    // require("./controllers/Default.js").generateCSV();
    // 下面不能加'echo-protocol'，否则会报Can`t connect due to "Sec-WebSocket-Protocol header"的错。因为服务器没有返回对应协议规定的信息

    
});

