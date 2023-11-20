    const express = require('express');
    const cors = require('cors');
    const stripe = require('stripe')('sk_test_51OEATeKNWVvnHiSQpYGfDjn2aWK3PzbuKZSxn59kqgg4uOv701TGwN87XXMJWvZ6Po9WvIQYym3fdMGszDGXmwvI00MZmaHMNt');
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    var jwt = require('jsonwebtoken');
    const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
    const app = express();
    const port = process.env.PORT || 5000;
    require('dotenv').config()
    // middleware 
    app.use(cors({
    origin: "http://localhost:5173"
    }));
    app.use(express.json());

    // bistroBoss

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
    const paymentCollection = client.db('bistroDB').collection('payments');

    // jwt related api 
    app.post('/jwt', async (req, res) => {
      try {
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCEASS_TOKEN_SECRET, { expiresIn: '365d' });
        res.send({ token })
      }
      catch (err) {
        console.log(err);
      }
    })
    // verify token for middleware 
    const verifyToken = (req, res, next) => {
      try {
        // console.log('inside verify token===>', req?.headers?.authorization);
        if (!req?.headers?.authorization) {
          return res.status(401).send({ message: 'unAuthorized access' })
        }
        const token = req?.headers?.authorization?.split(' ')[1];
        jwt.verify(token, process.env.ACCEASS_TOKEN_SECRET, (error, decoded) => {
          if (error) {
            console.log(error);
            return res.status(401).send({ message: 'unAuthorized access access' })
          }
          req.user = decoded;
          next();
        })
      }
      catch (err) {
        console.log(err);
      }
    }
    // use verify admin after verify token
    const verfyAdmin = async (req, res, next) => {
      try {
        const email = req.user?.email;
        // console.log(req.user);
        const query = { email: email };
        const user = await userCollection.findOne(query);
        // console.log('admin user--->', user?.role);
        // console.log(user);
        const isAdmin = user?.role === 'admin';
        console.log(isAdmin);

        if (!isAdmin) {
          return res.status(403).send({ message: 'forbidden access' })
        }
        next()
      }
      catch (error) {
        console.log(error);
      }
    }


    // user related api 
    app.get('/users', verifyToken, verfyAdmin, async (req, res) => {
      try {

        const result = await userCollection.find().toArray();
        res.send(result)
      }
      catch (error) {
        console.log(error);
      }
    })

    app.get('/users/admin/:email', verifyToken, async (req, res) => {
      try {
        const email = req.params.email;
        console.log('email of =====>', req.user?.email, 'vs ====>', email);
        if (email !== req.user?.email) {
          return res.status(403).send({ message: 'forbidden access' })
        }
        const query = { email: email };
        const user = await userCollection.findOne(query);
        // console.log(user);
        let admin = false;
        if (user) {
          admin = user?.role === 'admin'
        }
        res.send({ admin })
      }
      catch (err) {
        console.log(err);
      }
    })

    app.post('/users', async (req, res) => {
      try {
        const user = req.body;
        // insert email if user doesn't exiest
        // you can do this many wasy 
        // 1..email unique
        // 2.. upsert
        // 3.. simple checking
        const query = { email: user.email };
        const existingUser = await userCollection.findOne(query);
        if (existingUser) {
          return res.send({ message: 'user already exists', insertedId: null })
        }
        const result = await userCollection.insertOne(user);
        res.send(result);
      }
      catch (error) {
        console.log(error);
      }
    })

    app.patch('/users/admin/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: {
            role: 'admin'
          }
        }
        const result = await userCollection.updateOne(filter, updatedDoc);
        res.send(result)

      }
      catch (err) {
        console.error(err);
      }
    })

    app.delete('/users/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await userCollection.deleteOne(query);
        res.send(result);
      }
      catch (err) {
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

    app.get('/menu/:id', async(req,res) => {
      try{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await menuCollection.findOne(query);
        res.send(result)
      }
      catch(err){
        console.log(err);
      }
    })


    app.post('/menu', verifyToken, verfyAdmin, async (req, res) => {
      try {
        const menuItem = req.body;
        const result = await menuCollection.insertOne(menuItem);
        res.send(result)
      }
      catch (err) {
        console.log(err);
      }
    })

    app.patch('/menu/:id', async(req,res) => {
      try{
        const item = req.body;
        const id = req.params.id;
        const filter = {_id:new ObjectId(id)};
        const updatedDoc = {
          $set: {
            name: item.name,
            category: item.category,
            price:item.price,
            recipe:item.recipe,
            image:item.image
          }
        }
        const result = await menuCollection.updateOne(filter,updatedDoc);
        res.send(result)
      }
      catch(error){
        console.log(error);
      }
    })

    app.delete('/menu/:id', verifyToken, verfyAdmin, async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        // console.log(query);
        const result = await menuCollection.deleteOne(query);
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
        // console.log(id);
        const query = { _id: new ObjectId(id) }
        const result = await cartCollection.deleteOne(query);
        res.send(result);

      }
      catch (err) {
        console.log(err);
      }
    })

    // payment intent(payment details)
    app.post('/create-payment-intent', async(req,res) => {
      try{
        const {price} = req.body;
        const amount = parseInt(price * 100);
        console.log(amount, 'amount inside value');
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency:'usd',
          payment_method_types:['card']
        });
        res.send({
          clientSecret: paymentIntent.client_secret
        })
      }
      catch(error){
        console.log(error);
      }
    })

    // payment related api 

    app.get('/payments/:email', verifyToken, async (req,res) => {
      const query = req.params.email;
      if(req?.params?.email !== req?.user?.email){
        return res.status(403).send({message:'forbidden access'})
      }
      const result = await paymentCollection.find(query).toArray();
      res.send(result);
    } )
    app.post('/payments', async(req,res) => {
      try{
        const payment = req.body;
        const paymentResult = await paymentCollection.insertOne(payment);

        // carefully delete each item from the cart

        console.log('peyment information--->', payment);
        const query = { _id: {
          $in:payment.cartIds.map(id => new ObjectId(id))
        }}
        const deleteResult = await cartCollection.deleteMany(query);
        res.send({paymentResult, deleteResult})

      }
      catch(err){
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