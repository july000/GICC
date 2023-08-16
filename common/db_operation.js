var db = require('./db_mongo');

exports.dbIni = function dbIni(projectName, proInfo, callback){
    db.dbini(projectName, proInfo, callback);
};

Post = function Post(collName, items, counter, callback){
    db.dbsaveMutiple(collName, items, counter, callback);
};

PostOne = function PostOne(collName, item, counter, callback){
    db.dbsave(collName, item, counter, callback);
};

Get = function Get(collName, query, times, callback){
    db.dbfindAll(collName, query, times, callback);
};

GetOne = function GetOne(collName, query, times, callback){
    db.dbfindOne(collName, query, times, callback);
};

GetOne_2D = function GetOne_2D(collName, query, times, t1, t2, callback){
    db.dbfindOne_2D(collName, query, times, t1, t2, callback);
};

GetOne_2Dobj = function GetOne_2Dobj(collName, query, times, obj, callback){
    db.dbfindOne_2Dobj(collName, query, times, obj, callback);
};

Put = function Put(collName, query, new_items, times, callback){
    db.dbupdateMultiple(collName, query, new_items, times, callback);
};

PutOne = function PutOne(collName, query, new_item, times, callback){
    db.dbupdate(collName, query, new_item, times, callback);
};
Delete = function Delete(collName, query, times, callback){
    db.dbremove(collName, query, times, callback);
};

Close = function Close(){
    db.dbclose();
};

Drop = function Drop(dbName, callback){
    db.dbdrop(dbName, callback);
};

GetDBs = function GetDBs(callback){
    db.dbfindDBs(callback);
};

exports.DeleteAll = function DeleteAll(collName, query){
    db.dbremoveAll(collName, query);
};

Count = function Count(collName){
    db.dbcount(collName);
}