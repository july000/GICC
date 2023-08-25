var WebSocketClient = require("websocket").client;
var client = new WebSocketClient();
var isConnected = false;

client.on("connectFailed", function (error) {
	console.log(
		"[WebSocket service] WebSocket Connect Failed: " + error.toString()
	);
});

client.on("connect", function (connection) {
	console.log("[WebSocket service] WebSocket Client Connected");
	isConnected = true;

	connection.on("error", function (error) {
		console.log(
			"[WebSocket service] Connection Error: " + error.toString()
		);
	});

	connection.on("close", function () {
		console.log("[WebSocket service] echo-protocol Connection Closed");
		isConnected = false;
		reconnect();
	});

	connection.on("message", function (message) {
		// console.log("message", message);
		if (message.type === "utf8") {
			var mess = JSON.parse(message.utf8Data);
			if (mess.type !== 14) {
				return;
			}
			var obj = new RSMDataObj(mess);
			// console.log("111");
			PostOne("RSM", obj, 0, function (resCode, resMsg, times) {
				if (resCode !== 200) {
					console.debug(
						"[WebSocket service] Save file to RSM collection failed!"
					);
					return;
				}
				// console.log(
				// 	"Save file to RSM collection ---------------" +
				// 		resCode +
				// 		"-----------------"
				// );
			});
		}
	});

	function sendNumber() {
		if (connection.connected) {
			var number = Math.round(Math.random() * 0xffffff);
			connection.sendUTF(number.toString());
			setTimeout(sendNumber, 1000);
		}
	}
	sendNumber();
});

function connect() {
	client.connect(
		"ws://36.138.2.41:9873/api/websocket/connectServer/sim-gicc"
	);
}
module.exports.connect = connect;

function reconnect() {
	if (!isConnected) {
		console.log("[WebSocket service] WebSocketClient Reconnecting...");
		setTimeout(connect, 5000); // Reconnect after a 5-second delay
	}
}
module.exports.reconnect = reconnect;
