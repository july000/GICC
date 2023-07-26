'use strict';

var path = require('path');
var http = require('http');
var Joi = require('joi');
var oas3Tools = require('oas3-tools');
var serverPort = 8080;
global.token = ''
const getTrafficEvent = require('./common/Util').getTrafficEvent;


require("./common/db_operation").dbIni();


var WebSocketClient = require('websocket').client;
var schedule = require('node-schedule');
var client = new WebSocketClient();

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
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
                // console.log("Received type != 14 " + mess.type);
            }
            // console.log("Received: " + JSON.parse(JSON.stringify(message.utf8Data)) );
            // console.log("Received: " + typeof JSON.parse(JSON.stringify(message.utf8Data)) );
            // console.log("Received: " + typeof JSON.parse(message.utf8Data) );

            var obj = new RSMDataObj(mess);
            
 
            try {
                    
                    PostOne('RSM', obj, 0, function(code, rspmsg, t) {
                    //   if (err) throw err;
                    // console.log('Inserted item into collection');
                    });

                } catch (err) 
                {
                    // console.error('Error posting item:', err);
                }


            // Post('RSM', obj, 0, function(err, result) {
            //     if (err) throw err;
            //     console.log('Inserted item into collection');
            // });
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

// process.on('unhandledRejection', (reason, promise) => {
//     // console.error('未处理的 Promise 拒绝:', reason);
// });



var jobInstance = schedule.scheduleJob('*/2 * * * *', () => {
    try{
        console.log('------------------------------------The job is running at ' + new Date());
        var now = new Date();
        var timezoneOffset = 8 * 60;
        var startTimeDate = new Date(now.getTime() + timezoneOffset * 60 * 1000 - 10 * 60 * 1000); // 获取 startTime 的前五分钟
        var endTimeDate = new Date(now.getTime() + timezoneOffset * 60 * 1000 ); // 获取 startTime 的前五分钟

        var startTime = startTimeDate.toISOString();
        var endTime = endTimeDate.toISOString();

        // console.log("------- startTime endTime : " +startTime + "   " +endTime);

        // var startTime = '2023-07-25 08:00:00';
        // var endTime = '2023-07-25 08:35:00';
        // console.log("------- startTime endTime : " +startTime + "   " +endTime);

        // getTrafficEvent(startTime, endTime)
        //     .then(data => {


                // console.log(data);
                // var trafficEventList = JSON.parse(data).rows;
                // console.log("----------------------------- trafficEventList.length : ");
            return new Promise(function(resolve, reject){
                for (let i = 0; i < 5; i++){
                    // const event = trafficEventList[i];
                    // var trigger_time = Date.parse(event.trigger_time)
                    // var end_time = event.end_time
                    // var end_time = event.trigger_time// fix me
                    
                    // var enevt_id = event.id
                    // var enevt_type = event.type
                    // console.log("------------------ event id : "+event.id + " " + trigger_time + " i=" + i);

                    Get('RSM', {"data.timestamp": {$gte: 1690335629000, $lte: 1690339571000}}, i, function (resCode, resMsg, times, Obj){

                        console.log("------------------ times: "+i);

                        // return new Promise(function(resolve, reject){
                            if (resCode !== 200) {
                                console.error("GetOne event RSM file failed ---------------" + resCode + "-----------------");
                                reject(resCode);
                                return;
                            }
                            if (Obj) {
                                // console.log("===== size : "+Obj.length);
                                Obj.forEach(element => {
                                    // console.log("in each file id : "+ element.data.timestamp);
                                    element.event_id = 0
                                    PutOne('RSM_Event', {"data.timestamp": element.data.timestamp }, element, 0, function (resCode, resMsg, times) {
                                        if (resCode !== 200) {
                                            console.debug("post to RSM_FILTERED failed!");
                                            return;
                                        }
                                        // console.log("update to RSM_FILTERED ---------------" + resCode + "-----------------");
                                        resolve(resCode);
                                    });
                                });
                            }
                            else{
                                console.log("-=-=-=-=-=-=-==");
                            }

                            // else {
                            //     Post("RSM_FILTERED", , 0, function (resCode, resMsg, times) {
                            //         console.log("Create RSM_FILTERED ---------------" + resCode + "-----------------");
                            //         resolve(resCode);
                            //     });
                            // }
                        // })

                        
                        
                        
                    })
                }
            }).then(function(resCode){
                console.log("processEvents finished with code " + resCode);
            }).catch(function(err) {
                console.error("processEvents failed with error " + err);
            })
    } catch(err) {
        console.error(err);
    }
});


// var job = () => {
//     console.log('The job is running at ' + new Date());
// };
// var rule = new schedule.RecurrenceRule();
// rule.minute = new schedule.Range(0, 59, 1);
// var jobInstance = schedule.scheduleJob(rule, job);

// swaggerRouter configuration
var options = {
    routing: {
        controllers: path.join(__dirname, './controllers')
    },
};

var expressAppConfig = oas3Tools.expressAppConfig(path.join(__dirname, 'api/openapi.yaml'), options);
var app = expressAppConfig.getApp();
// client.connect('ws://36.138.2.41:9873/api/websocket/connectServer/sim-gicc'); //, 'echo-protocol');

// Initialize the Swagger middleware
// http.createServer(app).listen(serverPort, function () {
//     console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
//     console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
    
//     // 下面不能加'echo-protocol'，否则会报Can`t connect due to "Sec-WebSocket-Protocol header"的错。因为服务器没有返回对应协议规定的信息

    
// });

