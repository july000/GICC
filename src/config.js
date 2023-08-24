var os = require("os");
var path = require("path");
var fs = require("fs-extra");

var config = (function () {
	var rootDir = path.resolve(os.homedir(), ".simone");
	fs.ensureDirSync(rootDir);

	var dataDir = path.resolve(rootDir, "data/csv");
	fs.ensureDirSync(dataDir);

	return {
		rootDir,
		dataDir,
	};
})();

module.exports = config;
