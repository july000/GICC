var path = require("path");
//从fes_server.ini读取配置
var ini = require("./iniOperation").loadFileSync(path.join(__dirname, "Conf.ini"));

exports.schedualTask = function(element){
    //取得schedualTask  Section
    var task = ini.getOrCreateSection("schedualTask");
    switch (element){
        case "deleteRSM":
            return task.deleteRSM;
        case "deleteRSM_Event":
            return task.deleteRSM_Event;
        default:
            return task;
    }
};

exports.csvPath = function(element){
    //取得csvPath  Section
    var csvPath = ini.getOrCreateSection("csvPath");
    switch (element){
        case "path":
            return csvPath.path;
        default:
            return csvPath;
    }
};

exports.swigger = function(element){
    //取得swigger  Section
    var swigger = ini.getOrCreateSection("swigger");
    switch (element){
        case "ip":
            return swigger.ip;
        case "port":
            return swigger.port;
        default:
            return swigger;
    }
};

exports.mongodb= function(element){
    //取得dual  Section
    var mongodb = ini.getOrCreateSection("mongodb");
    switch (element){
        case "ip":
            return mongodb.ip;
        case "port":
            return mongodb.port;
        default:
            return dual;
    }
};

timeoutConfig= function(element){
    //取得timeout  Section
    var timeout = ini.getOrCreateSection("timeout");
    switch (element){
        case "wouldblock":
            return timeout.wouldblock;
        default:
            return timeout;
    }
};

webConfig = function(element){
    //取得web  Section
    var web = ini.getOrCreateSection("web");
    switch (element){
        case "port":
            return web.port;
        case "max_thread_count":
            return web.max_thread_count;
        case "sendType":
            return web.sendType;
        case "projectName":
            return web.projectName;
        default:
            return web;
    }
};

txtConfig = function(element){
    //取得txt  Section
    var txt = ini.getOrCreateSection("txt");
    switch (element){
        case "filename":
            return txt.filename;
        default:
            return txt;
    }
};

udpConfig = function(element){
    //取得udp  Section
    var udp = ini.getOrCreateSection("udp");
    switch (element){
        case "sendUdpIp":
            return udp.sendUdpIp;
        case "sendUdpPort":
            return udp.sendUdpPort;
        default:
            return udp;
    }
};
