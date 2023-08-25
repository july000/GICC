var os = require("os");
var path = require("path");
var fs = require("fs-extra");

var config = (function () {
	var rootDir = path.resolve(os.homedir(), ".simone");
	fs.ensureDirSync(rootDir);

	var subpath = require("./common/IniConfig").csvPath("path");

	var dataDir = path.resolve(rootDir, subpath);

	fs.ensureDirSync(dataDir);

	return {
		rootDir,
		dataDir,
	};
})();

module.exports = config;
