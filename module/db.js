let MongoClient = require('mongodb').MongoClient;

let ObjectID = require('mongodb').ObjectID;

const url = 'mongodb://127.0.0.1:27017';
/*
* // connect mongodb
* @params(callback, function)
*/

function connectMongle(callback) {
	MongoClient.connect(url, (err, client) => {
		if(err) {
			console.log(err);
			return false;
		}
		callback(client);
	})
}


/*
* //export a function to find data in DB
* DB.find(collection, condition, callback)
* @params(database, string)
* @params(collection, string)
* @params(condition, json)
* @params(callback, function)
*/
function find(database, collection, condition, callback) {
	connectMongle(client =>{
		let dbFind = client.db(database).collection(collection).find(condition);
		dbFind.toArray((err, data) => {
			callback(err, data);
		});
	})
}


/*
* //export a function to insert one data to DB
* DB.find(database, collection, condition, callback)
* @params(database, string)
* @params(collection, string)
* @params(condition, json)
* @params(callback, function)
*/

function insertOne(database, collection, condition, callback) {
	connectMongle(client => {
		client.db(database).collection(collection).insertOne(condition, (err, data) => {
			callback(err, data)
		})
	})
}


/*
* //export a function to delete one data to DB
* DB.find(database, collection, condition, callback)
* @params(database, string)
* @params(collection, string)
* @params(condition, json)
* @params(callback, function)
*/

function deleteOne(database, collection, condition, callback) {
	connectMongle(client => {
		client.db(database).collection(collection).deleteOne(condition, (err, data) => {
			callback(err, data)
		})
	})
}

/*
* //export a function to delete one data to DB
* DB.find(database, collection, condition, callback)
* @params(database, string)
* @params(set, json) // to replace the old value
* @params(collection, string)
* @params(condition, json)
* @params(callback, function)
*/

function updateOne(database,collection,json,replace,callback) {
	// let [database,collection,json,replace,callback] = rest;
	// console.log(database,collection);
	connectMongle(client => {
		client.db(database).collection(collection).updateOne(json, {$set: replace}, (err, data) => {
			callback(err, data);
		})
	})
}

function  __connectDb(callback){


	MongoClient.connect(DbUrl,function(err,db){

		if(err){

			console.log('Êý¾Ý¿âÁ¬½ÓÊ§°Ü');
			return;
		}
		//Ôö¼Ó ÐÞ¸Ä É¾³ý

		callback(db);


	})

}
function update(collectionname,json1,json2,callback){

	__connectDb(function(db){
		db.collection(collectionname).updateOne(json1,{$set:json2},function(error,data){

			callback(error,data);
		})
	})

}





module.exports = {
	find,
	insertOne,
	deleteOne,
	updateOne,
	update,
	ObjectID
}



