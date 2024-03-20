const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017";
let client = null;

async function connectToDatabase() {
    if (client) {
        return client;
    }

    try {
        client = new MongoClient(uri, {});
        await client.connect();
        console.log("Connected to MongoDB");
        return client;
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
        throw err;
    }
}

module.exports = connectToDatabase;
