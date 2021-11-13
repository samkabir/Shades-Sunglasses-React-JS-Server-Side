const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qmw5x.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect();
        console.log('database connected!')
        const database = client.db('shades_sunglasses');
        const productsCollection = database.collection('products');
        const reviewsCollection = database.collection('reviews');
        const ordersCollection = database.collection('orders');
        const usersCollection = database.collection('users');

        //Getting All Products
        app.get('/products', async (req, res) => {  
            const cursor = productsCollection.find({});
            const allProducts = await cursor.toArray();
            res.json(allProducts);
        })

        //Getting Single Product
        app.get('/products/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.json(product);
        });
        
        //Deleting a Product
        app.delete('/products/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const result = await productsCollection.deleteOne(query);
            res.json(result);
          })

        // Getting Orders by email
        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            res.json(orders);
        })

        //Getting All Orders
        app.get('/ordersall', async (req, res) => {  
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.json(orders);
        })
        
        //Getting all Review
        app.get('/reviews', async (req, res) => {  
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.json(reviews);
        })

        //Update status
        app.put('/ordersall/:id', async(req, res)=> {
            const id = req.params.id;
            const filter = {_id: ObjectId(id) };
            const options = { upsert: true }; 
            const updateDoc = {
              $set: {
                status:'Shipped'
              }
            }
            const result = await ordersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
          })

        //Posting One Review
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.json(result);
        });

        //Posting Order Info
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result);
        });

        //Posting new User
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        //Posting new Product
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.json(result);
        });

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateUser = { $set: user };
            const result = await usersCollection.updateOne(filter, updateUser, options);
            res.json(result);
        });

        //Making an Admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })
        
        //Admin access
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        //Deleting an Order
        app.delete('/orders/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
          })

        app.delete('/ordersall/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id:ObjectId(id)};
        const result = await ordersCollection.deleteOne(query);
        res.json(result);
        })

    }
    finally{
        // await client.closes();
    }
}  
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello! This is Shades!');
  })
  
  app.listen(port, () => {
    console.log(`Listening at Port :${port}`);
  })