const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

    const userCollection = client.db('bistroDB').collection('users');
    const menuCollection = client.db('bistroDB').collection('menu');
    const reviewCollection = client.db('bistroDB').collection('reviews');
    const cartCollection = client.db('bistroDB').collection('carts');

    // user related api 
    app.get('/users', async(req,res) => {
      try{
        const result = await userCollection.find().toArray();
        res.send(result)
      }
      catch(error){
        console.log(error);
      }
    })
    app.post('/users', async(req,res) => {
      try{
        const user = req.body;
        // insert email if user doesn't exiest
        // you can do this many wasy 
        // 1..email unique
        // 2.. upsert
        // 3.. simple checking
        const query = {email: user.email};
        const existingUser = await userCollection.findOne(query);
        if(existingUser){
          return res.send({message : 'user already exists', insertedId:null})
        }
        const result = await userCollection.insertOne(user);
        res.send(result);
      }
      catch(error){
        console.log(error);
      }
    })

    app.patch('/users/admin/:id', async(req,res) => {
      try{
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)};
        const updatedDoc = {
          $set: {
            role: 'admin'
          }
        }
        const result = await userCollection.updateOne(filter,updatedDoc);
        res.send(result)

      }
      catch(err){
        console.error(err);
       }
    })

    app.delete('/users/:id', async(req,res) => {
     try{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await userCollection.deleteOne(query);
      res.send(result);
     }
     catch(err){
      console.error(err);
     }
    })


    // menu related api 
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
        const query = { email: email }
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

    app.delete('/carts/:id', async (req, res) => {
      try {
        const id = req.params.id;
        console.log(id);
        const query = {_id: new ObjectId(id)}
        const result = await cartCollection.deleteOne(query);
        res.send(result);

      }
      catch (err) {
        console.log(err);
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