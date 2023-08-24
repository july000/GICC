var path = require("path");
//从fes_server.ini读取配置
var ini = require("./iniOperation").loadFileSync(path.join(__dirname, "Conf.ini"));

exports.fesConfig = function(element){
    //取得fes  Section
    var fes = ini.getOrCreateSection("fes");
    switch (element){
        case "ip":
            return fes.ip;
        case "port":
            return fes.port;
        case "monitor":
            return fes.monitor;
        case "real_time":
            return fes.real_time;
        case "guid":
            return fes.guid;
        case "projectName":
            return fes.projectName;
        case "db":
            return fes.db;
        case "log":
            return fes.log;
        default:
            return fes;
    }
};

cloudConfig = function(element){
    //取得cloud  Section
    var cloud = ini.getOrCreateSection("cloud");
    switch (element){
        case "cloudIp":
            return cloud.cloudIp;
        default:
            return cloud;
    }
};

procmanConfig = function(element){
    //取得procman  Section
    var procman = ini.getOrCreateSection("procman");
    switch (element){
        case "ip":
            return procman.ip;
        case "port":
            return procman.port;
        default:
            return procman;
    }
};

dualConfig= function(element){
    //取得dual  Section
    var dual = ini.getOrCreateSection("dual");
    switch (element){
        case "use":
            return dual.use;
        case "local_port":
            return dual.local_port;
        case "remote_ip":
            return dual.remote_ip;
        case "remote_port":
            return dual.remote_port;
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
