// J'Importe le framework Express
const express = require('express');
const app = express();

// Pour permettre les connection en CORS
// Ici je permet toutes les connections
// Quelque chose a ne pas faire en PROD
const cors = require('cors');
app.use(cors());

// Je me connecte avec la DB
const initDB = require('./connectionMongo.js');
const connection = initDB();

// Je permet a express de recevoir et de lire
// Correctement les JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Je me permet de créer des object ID a la mongoDB
const { ObjectId } = require('mongodb');

// J'active ma connection vers ma collection
let client = null;
let database = null;
let collection = null;

async function initElement() {
    client = await connection;
    database = client.db("kitty");
    collection = database.collection("orders");
}

initElement();

// Je commence a ecrire mes routes
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/orders/getAll', async (req, res) => {
    const result = await collection.find().toArray();
    res.send(result);
})

app.get('/orders/findById/:id', async (req, res) => {
    try {
        const result = await collection.findOne({ _id: new ObjectId(req.params.id) });

        if (!result) {
            return res.status(404).send("Aucun document trouvé avec cet ID.");
        }

        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send("Erreur lors de la recherche du document.");
    }
});

app.get('/orders/findByCustomerId/:id', async (req, res) => {
    try {
        const result = await collection.find({ customer_id: parseInt(req.params.id) }).toArray();

        if (!result || result.length == 0) {
            return res.status(404).send("Aucun document trouvé pour cet ID client.");
        }

        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send("Erreur lors de la recherche du document.");
    }
});

app.post('/orders', async (req, res) => {
    let newDoc = req.body;

    if (!listProducts.includes(newDoc.product)) {
        let problem = newDoc.product + " n'est pas un produit en vente ici ";
        console.log(problem);
        res.send(problem);
        return null;
    }
    let newID = await getNextID();
    console.log(typeof newID);
    newDoc.order_id = newID;
    newDoc.order_date = new Date();

    const result = await collection.insertOne(newDoc);
    res.send(result);
})

// ATTENTION : L'utilisation d'identifiants séquentiels peut entraîner des problèmes d'évolutivité dans des scénarios à fort trafic.
// Cette fonction, `getNextID`, illustre une opération bloquante où elle récupère l'ID de la dernière commande
// et l'incrémente pour générer un nouvel ID. Dans des environnements avec des requêtes concurrentes, cette approche
// peut considérablement ralentir le système en raison de la nature séquentielle de la génération d'ID.
// Bien que cette méthode soit simple et puisse servir à des fins éducatives, il est crucial de comprendre
// ses limitations et pourquoi elle est généralement déconseillée dans des environnements de production, en particulier
// pour des applications devant évoluer ou gérer de nombreuses requêtes simultanées.

// Pour un projet réel, il est recommandé d'utiliser le champ _id généré par MongoDB ou un UUID (Universal Unique Identifier).
// Ces approches permettent d'éviter les goulots d'étranglement liés à la génération séquentielle d'ID et offrent une meilleure évolutivité.
async function getNextID() {
    // Récupère la commande la plus récente en triant par order_id de manière descendante, en limitant le résultat à la dernière entrée.
    const lastOrder = await collection.find({ "order_id": { $exists: true, $not: { $type: "object" } } }, { projection: { _id: 0, order_id: 1 } }).sort({ order_id: -1 }).limit(1).toArray();
    let newOrderId = 1; // Défaut à 1 s'il n'y a pas de commandes.

    // Si une commande existe, incrémenter le plus haut order_id pour générer le nouvel ID.
    if (lastOrder.length > 0) {
        newOrderId = lastOrder[0].order_id + 1;
    }

    return newOrderId;
}

app.post('/orders/random', async (req, res) => {

    const newDoc = {
        order_id: await getNextID(),
        customer_id: getRandomInt(1, 30),
        product: getRandomProducts(),
        quantity: getRandomInt(1, 6),
        price: getRandomInt(100, 600),
        order_date: new Date()
    };

    const result = await collection.insertOne(newDoc);
    res.send(result);
})

app.post

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const listProducts = ["Headphones", "Camera", "Laptop", "Tablet", "Smartphone", "Chair"];

function getRandomProducts() {
    return listProducts[getRandomInt(0, listProducts.length - 1)];
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min) + min);
}
