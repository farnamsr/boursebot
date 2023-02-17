const { MongoClient } = require('mongodb');
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'boursebot';


async function connection() {
    await client.connect();
    return client.db(dbName);
}

exports.connection = connection()