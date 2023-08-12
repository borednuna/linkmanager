const express = require('express');
const app = express();
const cors = require('cors');
const PORT = 3000;

// load configs
require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => res.send('Server repository for manual linktree'));

// Configure SDK
const admin = require('firebase-admin');
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://asramaputra-f1910.firebaseio.com' // Replace with your Firebase project URL
});

const db = admin.firestore();

// Endpoint to read all data
async function getAllLinks(collection) {
    try {
        const snapshot = await db.collection(collection).get();
        const data = snapshot.docs.map(doc => {
            return {
                id: doc.id,
                data: doc.data()
            };
        });
        return data;
    } catch (error) {
        console.log(error);
        return error;
    }
}

app.get('/getAll/:collection', async (req, res) => {
    const collection = req.params.collection;
    const data = await getAllLinks(collection);
    res.send(data);
});

// Endpoint to add new link
async function addLink(collection, link, string) {
    try {
        await db.collection(collection).doc().set({
            link,
            string
        });
        console.log('Document added successfully.');
    } catch (error) {
        console.log(error);
    }
}

app.post('/addLink', async (req, res) => {
    const { collection, link, string } = req.body;
    await addLink(collection, link, string);
    res.send('Link added successfully.');
});

// Endpoint to delete link
async function deleteLink(collection, documentId) {
    try {
        await db.collection(collection).doc(documentId).delete();
        console.log('Document deleted successfully.');
    } catch (error) {
        console.log(error);
    }
}

app.delete('/deleteLink/:collection/:documentId', async (req, res) => {
    const collection = req.params.collection;
    const documentId = req.params.documentId;
    await deleteLink(collection, documentId);
    res.send('Link deleted successfully.');
});

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
