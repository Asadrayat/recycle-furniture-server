const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8nnhhq6.mongodb.net/?retryWrites=true&w=majority`;


function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const catagoriesCollection = client.db('recycle-furniture').collection('catagories');
        const diningCollection = client.db('recycle-furniture').collection('dining');
        const bedroomCollection = client.db('recycle-furniture').collection('bedroom');
        const livingCollection = client.db('recycle-furniture').collection('living');
        const bookingsCollection = client.db('recycle-furniture').collection('bookings');
        const usersCollection = client.db('recycle-furniture').collection('users');
        const verifyAdmin = async (req, res, next) => {
            console.log('inside verify admin', req.decoded.email);
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await usersCollection.findOne(query);

            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            next();
        }
        app.get('/catagoryOptions', async (req, res) => {
            const query = {};
            const result = await catagoriesCollection.find(query).toArray();
            res.send(result);
        });
        app.get('/Dining', async (req, res) => {
            const query = {};
            const result = await diningCollection.find(query).toArray();
            res.send(result);
        });
        app.get('/Bedroom', async (req, res) => {
            const query = {};
            const result = await bedroomCollection.find(query).toArray();
            res.send(result);
        });
        app.get('/Living', async (req, res) => {
            const query = {};
            const result = await livingCollection.find(query).toArray();
            res.send(result);
        });
        app.get('/catagoryOptions/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const catagories = await catagoriesCollection.findOne(query);
            res.send(catagories);
        });
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.Access_Token)
                return res.send({ accessToken: token })
            }
            res.status(403).send({ accessToken: '' })
        })
        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            // console.log(result);
            res.send(result);
        })
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        })
        app.put('/users/admin/:id', verifyAdmin, verifyJWT, async (req, res) => {

            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })
        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;

            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden access' });
            }
            const query = { email: email };
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
        })
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            // const query = {
            //     // appointmentDate: booking.appointmentDate,
            //     email: booking.email,
            // }
            // treatement: booking.treatement
            // }
            // const alreadyBooked = await bookingsCollection.find(query).toArray();
            // if (alreadyBooked.length) {
            //     const message = `You have already booking on ${booking.appointmentDate}`;
            //     return res.send({ acknowledged: false, message })

            // }
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
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