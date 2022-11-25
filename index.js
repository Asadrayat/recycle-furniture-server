const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8nnhhq6.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const catagoriesCollection = client.db('recycle-furniture').collection('catagories');
        const diningCollection = client.db('recycle-furniture').collection('dining');
        app.get('/catagoryOptions', async (req, res) => {
            const query = {};
            const result = await catagoriesCollection.find(query).toArray();
            res.send(result);
        });
        app.get('/dining', async (req, res) => {
            const query = {};
            const result = await diningCollection.find(query).toArray();
            res.send(result);
        });
        app.get('/catagoryOptions/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id:ObjectId(id) };
            const catagories = await catagoriesCollection.findOne(query);
            res.send(catagories);
        });

    }
    finally {

    }
}
run().catch(console.log);

app.get('/', async (req, res) => {
    res.send('recycle bin server is running');
})

app.listen(port, () => console.log(`Recycle bin is running on ${port}`))