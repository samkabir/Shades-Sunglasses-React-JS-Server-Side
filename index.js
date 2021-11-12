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

        
        //Getting all Review
        app.get('/reviews', async (req, res) => {  
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.json(reviews);
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