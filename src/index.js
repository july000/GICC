"use strict";

var path = require("path");
var fs = require("fs");
var http = require("http");
var config = require("./config");
var oas3Tools = require("oas3-tools");
var express = require("express");
var bodyParser = require("body-parser");

var serverPort = 30088;

var convert = require("./service/DefaultService").convert;
// swaggerRouter configuration
var options = {
	routing: {
		controllers: path.join(__dirname, "./controllers"),
	},
};

var expressAppConfig = oas3Tools.expressAppConfig(
	path.join(__dirname, "api/openapi.yaml"),
	options
);
// var app = expressAppConfig.getApp();

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/data/csv/:file(*)", function (req, res, next) {
	try {
		const filePath = path.join(config.dataDir, req.params.file);
		if (!fs.existsSync(filePath)) {
			res.status(200).json({ status: false, result: "File not found!" });
		} else {
			res.setHeader(
				"Content-disposition",
				"attachment; filename=" + req.params.file
			);
			//filename is the name which client will see. Don't put full path here.
			res.setHeader("Content-type", "text/csv");

			var sendFile = fs.createReadStream(filePath);
			sendFile.pipe(res);
		}
	} catch (error) {
		console.log(error);
		res.status(200).json({ status: false, result: "Failed!" });
	}
});

app.post("/generateSceneData", function (req, res) {
	const eventlists = req.body.eventlists;
	convert(eventlists)
		.then((resMsg) => {
			var results = {};
			results["eventResultLists"] = resMsg;

			res.setHeader("Content-Type", "application/json");
			res.statusCode = 200;
			res.end(JSON.stringify(results));
		})
		.catch((error) => {
			console.error(error);
		});
});
// Initialize the Swagger middleware
http.createServer(app).listen(serverPort, function () {
	console.log(
		"Your server is listening on port %d (http://localhost:%d)",
		serverPort,
		serverPort
	);
	console.log(
		"Swagger-ui is available on http://localhost:%d/docs",
		serverPort
	);

	require("./service/webSocketService").connect();
	require("./service/scheduleJobService").scheduleDeleteRSM();
	require("./service/scheduleJobService").scheduleDeleteRSMEvent();
});
