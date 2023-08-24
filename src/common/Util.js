const request = require("request");

getTrafficEvent = function getTrafficEvent(startTime, endTime) {
	return new Promise((resolve, reject) => {
		const options = {
			url: `http://36.138.2.41:9873/api/event/screenEvent/listEvent?startTime=${startTime}&endTime=${endTime}`,
			headers: {
				AccessToken: global.token,
			},
		};
		request(options, function (error, response, body) {
			if (error) {
				reject(error);
			} else if (JSON.parse(body).errorCode === 401) {
				login("user-fangzhen", "fangzhen@123")
					.then((newToken) => {
						global.token = newToken;
						return getTrafficEvent(startTime, endTime);
					})
					.then((data) => {
						resolve(data);
					})
					.catch((error) => {
						reject(error);
					});
			} else if (response.statusCode === 200) {
				// console.log("--------------------- getTrafficEvent result : " + JSON.parse(body));
				resolve(body);
			} else {
				reject(
					new Error(
						`Server responded with status code ${response.statusCode}`
					)
				);
			}
		});
	});
};
exports.getTrafficEvent = getTrafficEvent;

// get /vehicleevent/

getVehicleEvent = function getVehicleEvent(startTime, endTime) {
	return new Promise((resolve, reject) => {
		const options = {
			url: "http://36.138.2.41:9873/api/car/sceneFeedbackRecord/listWarn",
			headers: {
				AccessToken: global.token,
			},
		};

		request(options, function (error, response, body) {
			if (error) {
				reject(error);
			} else if (JSON.parse(body).errorCode === 401) {
				// 如果返回的状态码是 401，并且返回的 JSON 中 message 字段是 "登录状态已过期"，则重新登录并重新调用 getListEvent 函数
				login("user-fangzhen", "fangzhen@123")
					.then((newToken) => {
						global.token = newToken;
						return getVehicleEvent(startTime, endTime);
					})
					.then((data) => {
						resolve(data);
					})
					.catch((error) => {
						reject(error);
					});
			} else if (response.statusCode === 200) {
				resolve(body);
			} else {
				reject(
					new Error(
						`Server responded with status code ${response.statusCode}`
					)
				);
			}
		});
	});
};
exports.getVehicleEvent = getVehicleEvent;

login = function login(username, password) {
	return new Promise((resolve, reject) => {
		const options = {
			url: "http://36.138.2.41:9873/api/auth/login",
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: {
				userName: username,
				password: password,
			},
			json: true,
		};
		// console.log("enter login function : " + options.body.password+" "+ options.body.password);

		request(options, function (error, response, body) {
			if (error) {
				reject(error);
			} else if (response.statusCode === 200) {
				// console.log("---login success , new token : " + typeof JSON.parse(JSON.stringify(body)).result.token );
				resolve(JSON.parse(JSON.stringify(body)).result.token);
			} else {
				reject(
					new Error(
						`Server responded with status code ${response.statusCode}`
					)
				);
			}
		});
	});
};
exports.login = login;
