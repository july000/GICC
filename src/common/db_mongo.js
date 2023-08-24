"use strict";

const mongoose = require("mongoose");
var fs = require("fs");
// var dbmodel = require('./db_model');
var dbmodel = require("./db_model");

module.exports = {
	dbini: MongoInit,
	dbsave: MongoSav,
	dbsaveMutiple: MongoSaveMultiple,
	dbupdate: MongoUpdate,
	dbupdateMultiple: MongoUpdateMultiple,
	dbfindOne: MongoFindOne,
	dbfindOne_2D: MongoFindOne_2D,
	dbfindOne_2Dobj: MongoFindOne_2Dobj,
	dbfindAll: MongoFindAll,
	dbremove: MongoRemove,
	dbclose: MongoClose,
	dbdrop: MongoDrop,
	dbfindDBs: MongoGetDBs,
	dbremoveAll: MongoRemoveAll,
	dbcount: MongoCount,
};

function defaultProCreate() {
	MongoConnect();
}

function MongoInit(projectName, proInfo, callback) {
	// var currProName = require("./IniConfig").fesConfig("projectName");
	var currProName = "GICC";

	if (!projectName) {
		if (!currProName) {
			global.projectName = "undefined";
		} else {
			global.projectName = currProName;
		}
		defaultProCreate();
	}
}

function MongoConnect() {
	const mongoDB = "mongodb://127.0.0.1:27017/" + global.projectName;
	// mongoose.connect(mongoDB);
	try {
		mongoose.connect(mongoDB, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log(`Connected to MongoDB project`);
	} catch (err) {
		console.log(`MongoDB connection error`);
		// return err;
	}
	mongoose.Promise = global.Promise;
	const db = mongoose.connection;
	// db.on('error', console.error.bind(console, 'MongoDB 链接错误: '));
}

/* Schema */
function SetSchema(SchemaData, CollName) {
	var Schema = mongoose.Schema;
	var userDataSchema = new Schema(SchemaData);
	var UserData;

	try {
		UserData = mongoose.model(CollName, userDataSchema, CollName);
	} catch (e) {
		if (e.name === "OverwriteModelError") {
			UserData = mongoose.model(CollName);
		}
	}
	return UserData;
}

/* save */
function MongoSav(collName, item, times, callback) {
	/* set Schema */
	var Schema = SchemaSelector(collName);
	var DataModel = SetSchema(Schema, collName);
	var data = new DataModel(item);

	/* Method 1 */
	// data.save();
	// console.debug("item being saved!");

	/* Method 2 */
	// data.save(function (err, savedObject) {
	//     if (err) {
	//         console.debug(err);
	//         callback(500, err, times);
	//         return;
	//     }
	//     // console.debug("Saved Object: " + savedObject);
	//     // callback(200, "Obj saved!", savedObject);
	//     callback(200, "Obj saved!", times);
	// });

	data.save()
		.then((result) => {
			callback(200, "Obj saved!", times);
		})
		.catch((err) => {
			console.error(err);
			callback(500, err, times);
		});
}

function MongoSaveMultiple(collName, items, times, callback) {
	/* set Schema */
	var Schema = SchemaSelector(collName);
	var DataModel = SetSchema(Schema, collName);

	/* Create an array to store the promises for each save operation */
	var promises = [];

	/* Loop through the items array and create a new DataModel instance for each item */
	items.forEach(function (item, index) {
		var data = new DataModel(item);

		promises.push(data.save());
	});

	/* Wait for all promises to resolve */
	Promise.all(promises)
		.then(function (savedObjects) {
			console.debug("Saved Objects: " + savedObjects);
			callback(200, "Objects saved!", times);
		})
		.catch(function (err) {
			console.debug(err);
			callback(500, err, times);
		});
}

/* find */
function MongoFindOne(collName, query, times, callback) {
	var Schema = SchemaSelector(collName);
	var DataModel = SetSchema(Schema, collName);

	// DataModel.findOne(query, function (err, foundData) {
	//     if (err) {
	//         console.debug(err);
	//         callback(500, err, times);
	//         return;
	//     }
	//     // console.debug(require('util').inspect(foundData, true, null));
	//     if(foundData){
	//         if(foundData._doc.hasOwnProperty("_id")){
	//             delete foundData._doc._id;
	//         }
	//         if(foundData._doc.hasOwnProperty("__v")){
	//             delete foundData._doc.__v;
	//         }
	//         callback(200, "MongoFindOne Done!", times, foundData._doc);
	//     } else{
	//         callback(200, "MongoFindOne Done!", times, foundData);
	//     }
	// });

	DataModel.findOne(query)
		.then((result) => {
			if (result) {
				if (result._doc.hasOwnProperty("_id")) {
					delete result._doc._id;
				}
				if (result._doc.hasOwnProperty("__v")) {
					delete result._doc.__v;
				}
				callback(200, "MongoFindOne Done!", times, result._doc);
			} else {
				callback(200, "MongoFindOne Done!", times, result);
			}
		})
		.catch((err) => {
			console.error(err);
			callback(500, err, times);
		});
}

function MongoFindOne_2D(collName, query, times, t1, t2, callback) {
	console.log(
		"callback in MongoFindOne: times=" + times + " t1=" + t1 + " t2=" + t2
	);
	var Schema = SchemaSelector(collName);
	var DataModel = SetSchema(Schema, collName);

	// DataModel.findOne(query, function (err, foundData) {
	//     if (err) {
	//         console.debug(err);
	//         callback(500, err, times, foundData, t1, t2);
	//         return;
	//     }
	//     // console.debug(require('util').inspect(foundData, true, null));
	//     if(foundData){
	//         if(foundData._doc.hasOwnProperty("_id")){
	//             delete foundData._doc._id;
	//         }
	//         if(foundData._doc.hasOwnProperty("__v")){
	//             delete foundData._doc.__v;
	//         }
	//         callback(200, "MongoFindOne Done!", times, foundData._doc, t1, t2);
	//     } else{
	//         callback(200, "MongoFindOne Done!", times, foundData, t1, t2);
	//     }
	// });

	DataModel.findOne(query)
		.then((result) => {
			// console.debug(require('util').inspect(foundData, true, null));
			if (result) {
				if (result._doc.hasOwnProperty("_id")) {
					delete result._doc._id;
				}
				if (result._doc.hasOwnProperty("__v")) {
					delete result._doc.__v;
				}
				callback(200, "MongoFindOne Done!", times, result._doc, t1, t2);
			} else {
				callback(200, "MongoFindOne Done!", times, result, t1, t2);
			}
		})
		.catch((err) => {
			console.error(err);
			callback(500, err, times, foundData, t1, t2);
		});
}

function MongoFindOne_2Dobj(collName, query, times, obj, callback) {
	console.log("callback in MongoFindOne: times=" + times);
	var Schema = SchemaSelector(collName);
	var DataModel = SetSchema(Schema, collName);

	// DataModel.findOne(query, function (err, foundData) {
	//     if (err) {
	//         console.debug(err);
	//         callback(500, err, times, foundData);
	//         return;
	//     }
	//     // console.debug(require('util').inspect(foundData, true, null));
	//     if(foundData){
	//         if(foundData._doc.hasOwnProperty("_id")){
	//             delete foundData._doc._id;
	//         }
	//         if(foundData._doc.hasOwnProperty("__v")){
	//             delete foundData._doc.__v;
	//         }
	//         callback(200, "MongoFindOne Done!", times, obj, foundData._doc);
	//     } else{
	//         callback(200, "MongoFindOne Done!", times, obj, foundData);
	//     }
	// });

	DataModel.findOne(query)
		.then((result) => {
			// console.debug(require('util').inspect(foundData, true, null));
			if (result) {
				if (result._doc.hasOwnProperty("_id")) {
					delete result._doc._id;
				}
				if (result._doc.hasOwnProperty("__v")) {
					delete result._doc.__v;
				}
				callback(200, "MongoFindOne Done!", times, obj, result._doc);
			} else {
				callback(200, "MongoFindOne Done!", times, obj, result);
			}
		})
		.catch((err) => {
			console.debug(err);
			callback(500, err, times, foundData);
		});
}

function MongoFindAll(collName, query, times, callback) {
	/* set Schema */
	var Schema = SchemaSelector(collName);
	var DataModel = SetSchema(Schema, collName);

	/* Method 1 */
	// DataModel.find().then(function(doc){
	// 	console.debug("found items: "+doc);
	//     result = doc;
	//     return 200;
	// });

	/* Method 2 */
	// DataModel.find(query, function (err, foundData) {
	//     if (err) {
	//         console.debug(err);
	//         callback(500, err, times);
	//         return;
	//     }
	//     var Objs = [];
	//     foundData.forEach(function(item, index){
	//         // console.warn(item.toString());
	//         // var tmp = JSON.parse(item.toString());
	//         var tmp = {};
	//         for(var key in item._doc) {
	//             if (key !== "_id" && key !== "__v") {
	//                 tmp[key] = item._doc[key];
	//             }
	//         }
	//         Objs.push(tmp);
	//     });
	//     callback(200, "MongoFindAll Done!", times, Objs);
	// });

	DataModel.find(query)
		.then((result) => {
			var Objs = [];
			result.forEach(function (item, index) {
				// console.warn(item.toString());
				// var tmp = JSON.parse(item.toString());
				var tmp = {};
				for (var key in item._doc) {
					if (key !== "_id" && key !== "__v") {
						tmp[key] = item._doc[key];
					}
				}
				Objs.push(tmp);
			});
			callback(200, "MongoFindAll Done!", times, Objs);
		})
		.catch((err) => {
			console.error(err);
			callback(500, err, times);
		});
}

/* update */
function MongoUpdateById(schemaObj, collName, _id, new_item) {
	/* set Schema */
	var Schema = schemaObj;
	var DataModel = SetSchema(Schema, collName);

	DataModel.findById(_id, function (err, doc) {
		if (err) {
			return console.debug(err);
		}
		doc.title = new_item.title;
		doc.content = new_item.content;
		doc.author = new_item.author;
		doc.save();
	});
}

function MongoUpdate(collName, query, new_item, times, callback) {
	// query must be uniquely identified
	var Schema = SchemaSelector(collName);
	var DataModel = SetSchema(Schema, collName);

	var options = {
		upsert: true, // creates the object if it doesn't exist, defaults to false
		new: true, // return updated object
	};
	// DataModel.findOneAndUpdate(query, {$set: new_item}, options, function (err, doc) {
	//     if (err) {
	//         console.debug(err);
	//         callback(500, err, times);
	//         return;
	//     }
	//     // callback(200, "findOneAndUpdate done!", doc);
	//     callback(200, "findOneAndUpdate done!", times);
	// });

	DataModel.findOneAndUpdate(query, { $set: new_item }, options)
		.then((doc) => {
			// callback(200, "findOneAndUpdate done!", doc);
			callback(200, "findOneAndUpdate done!", times);
		})
		.catch((err) => {
			console.error(err);
			callback(500, err, times);
		});
}

function MongoUpdateMultiple(collName, query, new_items, times, callback) {
	var Schema = SchemaSelector(collName);
	var DataModel = SetSchema(Schema, collName);

	var options = {
		multi: true, // update multiple documents
		upsert: true, // creates the object if it doesn't exist, defaults to false
		new: true, // return updated object
	};

	DataModel.updateMany(query, { $set: new_items }, options)
		.then((result) => {
			// result.nModified contains the number of updated documents
			callback(200, "updateMany done!", times, result.nModified);
		})
		.catch((error) => {
			console.error(error);
			callback(500, error, times);
		});
}

/* remove */
function MongoDeleById(schemaObj, collName, _id) {
	/* set Schema */
	var Schema = schemaObj;
	var DataModel = SetSchema(Schema, collName);

	DataModel.findByIdAndRemove(_id).exec();
}

function MongoRemove(collName, query, times, callback) {
	/* set Schema */
	var Schema = SchemaSelector(collName);
	var DataModel = SetSchema(Schema, collName);

	// DataModel.findOneAndRemove(query, function (err) {
	//     if (err) {
	//         console.debug(err);
	//         callback(500, err, times);
	//         return;
	//     }
	//     console.debug("Remove done!");
	//     callback(200, "Remove done!", times);
	// });

	DataModel.findOneAndRemove(query)
		.then((result) => {
			console.log("------ " + result + " ------");
			console.debug("Remove done!");
			callback(200, "Remove done!", times);
		})
		.catch((err) => {
			console.debug(err);
			callback(500, err, times);
		});
}

/* close database */
function MongoClose() {
	mongoose.disconnect();
	console.debug("db closed");
}

/* drop database */
function MongoDrop(dbName, callback) {
	if (dbName === global.projectName) {
		console.error("Can't drop database being in use!");
		callback(500, "Can't drop database being in use!");
	} else {
		// mongoose.connect('mongodb://10.0.8.239:27017/' + dbName, {useMongoClient: true}, function () {
		//     mongoose.connection.db.dropDatabase();
		//     console.debug("DB " + dbName + " dropped!");
		//     callback(200, "DB " + dbName + " dropped!");
		// });
		mongoose
			.connect("mongodb://10.0.8.239:27017/" + dbName, {
				useMongoClient: true,
			})
			.then((result) => {
				mongoose.connection.db.dropDatabase();
				console.debug("DB " + dbName + " dropped!");
				callback(200, "DB " + dbName + " dropped!");
			})
			.catch((err) => {
				console.error(err);
				callback(500, "DB " + dbName + " dropped failed!");
			});
	}
}

function SchemaSelector(collName) {
	switch (collName) {
		case "RSM":
			return dbmodel.RSMDataObjSchema;
		case "RSM_Event":
			return dbmodel.EventRSMDataObjSchema;
		case "type_1":
			return dbmodel.type_1_Schema;
		case "QFv2x_obu":
			return dbmodel.QFv2x_obuSchema;
		case "QFv2x_rsu":
			return dbmodel.QFv2x_rsuSchema;
		case "QFv2x_TrafficLight":
			return dbmodel.QFv2x_TrafficLightSchema;
		case "QFv2x_light":
			return dbmodel.QFv2x_lightSchema;
		case "QFv2x_racodf":
			return dbmodel.QFv2x_racodfSchema;
		case "SenseTimeDetectionResult":
			return dbmodel.SenseTimeDetectionResultSchema;
		case "CameraIdentifyResult":
			return dbmodel.CameraIdentifyResultSchema;
		case "ZhiXingZhe":
			return dbmodel.ZhiXingZhe_dataSchema;
		case "Autowise":
			return dbmodel.Autowise_dataSchema;

		case "Epark_Device":
			return dbmodel.Epark_DeviceSchema;
		case "V2X_RSU":
			return dbmodel.V2X_RSUSchema;
		case "V2X_TrafficLight":
			return dbmodel.V2X_TrafficLightSchema;
		case "XinAnXian_RSU":
			return dbmodel.XinAnXian_RSUSchema;
		case "EPark_InteConnVehicle":
			return dbmodel.EPark_InteConnVehiclechema;
		case "EPark_VehicleWithOBU":
			return dbmodel.EPark_VehicleWithOBUSchema;
		case "EPark_VehicleConnected":
			return dbmodel.EPark_VehicleConnectedSchema;
		default:
			console.error("Invalid collection name");
	}
}

function MongoGetDBs(callback) {
	var Admin = mongoose.mongo.Admin;
	var connection = mongoose.createConnection(
		"mongodb://127.0.0.1:27017/" + global.projectName
	);

	connection.on("open", function () {
		new Admin(connection.db).listDatabases(function (err, result) {
			if (err) {
				console.err("MongoGetDBs failed: " + err);
				callback(500, "MongoGetDBs failed!");
			} else {
				var pros = [];
				console.debug("listDatabases succeeded");
				for (var i = 0; i < result.databases.length; i++) {
					if (result.databases[i].name === global.projectName) {
						MongoFindOne(
							"node",
							{ id: 1 },
							i,
							function (rspCode, rspMsg, times, obj) {
								var curPro = {
									id: 1,
									name: result.databases[times].name,
									description: "",
									default: true,
								};
								curPro.project = obj;
								pros.push(curPro);

								if (pros.length === result.databases.length) {
									callback(200, "MongoGetDBs success!", pros);
								}
							}
						);
					} else {
						var pro = {
							id: 1,
							name: result.databases[i].name,
							description: "",
							default: false,
						};
						pros.push(pro);
						if (pros.length === result.databases.length) {
							callback(200, "MongoGetDBs success!", pros);
						}
					}
				}
			}
			// mongoose.disconnect();
		});
	});
}

async function MongoRemoveAll(collName, query) {
	/* set Schema */
	var Schema = SchemaSelector(collName);
	var DataModel = SetSchema(Schema, collName);
	await DataModel.deleteMany(query)
		.then((result) => {
			console.log(`${result.deletedCount} documents deleted`);
		})
		.catch((err) => {
			console.debug(err);
			console.error("Error deleting documents:", err);
		});
}

async function MongoCount(collName) {
	/* set Schema */
	var Schema = SchemaSelector(collName);
	var DataModel = SetSchema(Schema, collName);

	return await DataModel.countDocuments({})
		.then((count) => {
			console.log("Number of documents in the collection:", count);
			return count;
		})
		.catch((err) => {
			console.error("Error counting documents:", err);
			throw err;
		});
}
