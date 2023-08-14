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
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, get, push, remove } = require("firebase/database");

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  // ...
  // The value of `databaseURL` depends on the location of the database
  databaseURL: process.env.FIREBASE_URI,
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(firebaseApp);

// Write data
async function writeDataAP(link, string) {
  try {
    const parentRef = ref(database, 'asramaputra/'); // Replace with your parent node
    const newChildRef = push(parentRef); // Generates a new unique key

    const newData = {
      link: link,
      string: string,
    };
    
    await set(newChildRef, newData);
    console.log('New data added successfully with unique key:', newChildRef.key);
  } catch (error) {
    console.error('Error writing data:', error);
  }
}

app.post('/addAP', async (req, res) => {
    const { link, string } = req.body;
    try {
        await writeDataAP(link, string);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while writing data.' });
    }
});

// Read data
async function readDataAP() {
  try {
    const linkRef = ref(database, 'asramaputra/');
    const linkSnapshot = await get(linkRef);
    const link = linkSnapshot.val();
    return link;
  } catch (error) {
    console.error('Error reading data:', error);
  }
}

app.get('/fetchAP', async (req, res) => {
    try {
      const linkData = await readDataAP();
      res.json(linkData);
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while reading data.' });
    }
  });

// Delete data
async function deleteData(linkId) {
    try {
      const dataRef = ref(database, 'asramaputra/' + linkId); // Replace with the path to the data you want to delete

      await remove(dataRef);
      console.log('Data deleted successfully.');
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  }

app.delete('/deleteAP/:linkId', async (req, res) => {
    const { linkId } = req.params;
    try {
        await deleteData(linkId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while deleting data.' });
    }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
