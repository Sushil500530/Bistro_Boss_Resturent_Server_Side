const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()
// middleware 
app.use(cors());
app.use(express.json())
// bistroBoss
// xEhf9Y5PAACVU4Be

const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.ruakr2a.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // await client.connect();
    await client.db("admin").command({ ping: 1 });

    const menuCollection = client.db('bistroDB').collection('menu');
    const reviewCollection = client.db('bistroDB').collection('reviews');
    const cartCollection = client.db('bistroDB').collection('carts');

    app.get('/menu', async (req, res) => {
      try {
        const result = await menuCollection.find().toArray()
        res.send(result)
      }
      catch (error) {
        console.log(error);
      }
    })
    app.get('/reviews', async (req, res) => {
      try {
        const result = await reviewCollection.find().toArray()
        res.send(result)
      }
      catch (error) {
        console.log(error);
      }
    })

    // cart collection 
    app.get('/carts', async (req, res) => {
      try {
        const email = req.query.email;
        const query = {email:email}
        const result = await cartCollection.find(query).toArray();
        res.send(result);
      }
      catch (err) {
        console.log(err);
      }
    })

    app.post('/carts', async (req, res) => {
      try {
        const cartItem = req.body;
        const result = await cartCollection.insertOne(cartItem);
        res.send(result)
      }
      catch (error) {
        console.error(error);
      }
    })





    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send("Birstro Boss Resturent is Running.....")
})

app.listen(port, () => {
  console.log(`Bistro Boss Resturent is Running on Port : ${port}`);
})

/****
 * ----------------------------------
 *  NAMING CONVENTION
 * --------------------------------
 *  crud operation korar jonno ja ja korar lagbe segulo holo ---------------
 * ------------------------------
 * app.get('/users)
 * app.get('/users/:id)
 * app.post(/users)
 * app.put('/users/:id)
 * app.patch('/users/:id)
 * app.delete('/users/:id)
 * 
 * 
 * 
 */