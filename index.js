'use strict';

var path = require('path');
var http = require('http');
var oas3Tools = require('oas3-tools');
var schedule = require('node-schedule');

require("./common/db_operation").dbIni();
const getTrafficEvent = require('./common/Util').getTrafficEvent;

var serverPort = 8080;
global.token = ''
var isConnected = false;


var WebSocketClient = require('websocket').client;
var client = new WebSocketClient();

client.on('connectFailed', function(error) {
    console.log('Connect Failed: ' + error.toString());
});

client.on('connect', function(connection) {
  console.log('WebSocket Client Connected');
  isConnected = true; 

  connection.on('error', function(error) {
      console.log("Connection Error: " + error.toString());
  });

  connection.on('close', function() {
      console.log('echo-protocol Connection Closed');
      isConnected = false; 
      reconnect();
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
        // console.log("Save file to RSM collection ---------------" + resCode + "-----------------");
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

function connect() {
  client.connect('ws://36.138.2.41:9873/api/websocket/connectServer/sim-gicc'); 
}

function reconnect() {
  if (!isConnected) {
      console.log('Reconnecting...');
      setTimeout(connect, 5000); // Reconnect after a 5-second delay
  }
}


var jobInstance = schedule.scheduleJob('*/5 * * * * *', () => {
  console.log('------------------------------------The job is running at ' + new Date());
  var now = new Date();
  var timezoneOffset = 8 * 60;
  var startTimeDate = new Date(now.getTime() + timezoneOffset * 60 * 1000 - 5 * 60 * 1000);
  var endTimeDate = new Date(now.getTime() + timezoneOffset * 60 * 1000 );

  var startTime = startTimeDate.toISOString();
  var endTime = endTimeDate.toISOString();

  getTrafficEvent(startTime, endTime)
    .then(data => {
        // console.log(data);
        var trafficEventList = JSON.parse(data).rows;
        console.log("----------------------------- trafficEventList.length : "+trafficEventList.length);
        var results = getData(trafficEventList)
        console.log("delete condition startTime" + Date.parse(startTime));
        DeleteAll('RSM', {"data.timestamp": {$lte:Date.parse(startTime)}});

    }).catch(error => {
      console.error(error);
    });
});


function getData(trafficEventList) {
  if (trafficEventList.length === 0) {
    console.log("trafficEventList is empty. Processing...");
    return Promise.resolve();
  }

  var promises = [];
  for (let i = 0; i < trafficEventList.length; i++) {
    const event = trafficEventList[i];
    var start_time = Date.parse(event.trigger_time)
    var end_time = Date.parse(event.end_time)
    
    var enevt_id = event.id
    var mecEsn = event.esn
    // console.log(event)
    // console.log("------------------ event id : "+event.id + " " + trigger_time + " i=" + i);

    promises.push(new Promise((resolve, reject) => {
      const query = {
        "data.mecEsn": mecEsn,
        "data.timestamp": {$gte:start_time, $lte:end_time}
      };
      console.log("RSM query condition :" + JSON.stringify(query));
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
                console.debug("post to RSM_Event failed!");
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


// swaggerRouter configuration
var options = {
    routing: {
        controllers: path.join(__dirname, './controllers')
    },
  };

var expressAppConfig = oas3Tools.expressAppConfig(path.join(__dirname, 'api/openapi.yaml'), options);
var app = expressAppConfig.getApp();
connect();
// Initialize the Swagger middleware
http.createServer(app).listen(serverPort, function () {
    console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
    console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
    // require("./controllers/Default.js").generateCSV();
    // 下面不能加'echo-protocol'，否则会报Can`t connect due to "Sec-WebSocket-Protocol header"的错。因为服务器没有返回对应协议规定的信息

    
});

