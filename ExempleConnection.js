const initDB = require('./connectionMongo.js');
const connection = initDB();

const helloWorldDoc = {
    message: "Hello, World!",
    timestamp: new Date()
};

let client;

async function insertKitty() {

    try {
        client = await connection;
        const database = client.db("helloKitty");
        const collection = database.collection("byebye_Kitty");

        const result = await collection.insertOne(helloWorldDoc);
        console.log(`A document was inserted with the _id: ${result.insertedId}`);
    } catch (err) {
        console.error("Failed to insert document:", err);
    } finally {
        if (client)
            await client.close();
    }
}

insertKitty();