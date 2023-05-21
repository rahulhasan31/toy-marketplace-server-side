const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 3000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// midle aware
app.use(express.json())
app.use(cors())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.sayatpw.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toysCollection = client.db("toys").collection('toyProduct')
    const allToysCollection = client.db("toys").collection('allToys')


    app.get('/toys', async (req, res) => {
      const query = {}
      const result = await toysCollection.find(query).toArray()
      res.send(result)
    })

    app.get('/toys/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await toysCollection.find(query).toArray()
      res.send(result)
    })

    // my Toys section 
    app.get('/all-toys', async(req, res)=>{
      const query={}
      const result= await allToysCollection.find(query).limit(20).toArray()
      res.send(result)
    })

    app.get('/all-toys/:id', async(req, res)=>{
      const id=req.params.id
      const query={_id:new ObjectId(id)}
      const result= await allToysCollection.findOne(query)
      res.send(result)
    })

    
    app.get('/my-toys', async (req, res) => {
      const query = {}
      
      const result = await allToysCollection.find(query).toArray()
      res.send(result)
    })
    app.get('/my-toys/search', async (req, res) => {
      const { searchTerm } = req.query;
      try {
        const toys = await allToysCollection.find({
          name: { $regex: searchTerm, $options: 'i' },
        }).toArray();
        res.json(toys);
      } catch (error) {
        res.status(500).json({ error: 'Failed to search toys' });
      }
    });
    app.get('/my-toys/:email', async (req, res) => {
      const email = req.params.email
     
      const query = { email: email }
      
     
      const result = await allToysCollection.find(query).sort({"price":1}).toArray()
      res.send(result)
    })
   




    app.get("/toysDetails/:id", async (req, res) => {
      const toyId = req.params.id; // Get the toy _id from the request parameters
      try {
        const toy = await toysCollection.findOne({ "toys._id": toyId }, { projection: { _id: 0, toys: { $elemMatch: { _id: toyId } } } });
        if (toy) {
          res.json(toy.toys[0]); // Send the toy details as the response
        } else {
          res.status(404).json({ error: "Toy not found" }); // Handle toy not found case
        }
      } catch (error) {
        res.status(500).json({ error: "Internal server error" });
      }
    });

    //update section put method
    app.get('/update', async (req, res) => {
      const query = {}
      const result = await allToysCollection.find(query).toArray()
      res.send(result)
    })
    app.get('/update/:id', async (req, res) => {
      const id = req.params.id

      const query = { _id: new ObjectId(id) }
      const result = await allToysCollection.findOne(query)
      res.send(result)
    })
    app.put('/update/:id', async (req, res) => {

      const id = req.params.id
      console.log(id);
      const query = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const editToys = req.body
      const updateToys = {
        $set: {

          price: editToys.price,
          description: editToys.detailDescription,
          quantity: editToys.availableQuantity
        }

      }
    
      const result = await allToysCollection.updateOne(query, updateToys, options)
      res.send(result)
    })

    
    app.delete('/update/:id', async(req, res)=>{
      const id =req.params.id
      const query={ _id: new ObjectId(id)}
     
      const result= await allToysCollection.deleteOne(query)
      res.send(result)
    })

   



    app.post('/add-toy', async (req, res) => {
      const toys = req.body
      const query = {
        pictureURL: toys.pictureURL,
        name: toys.name,
        sellerName: toys.sellerName,
        subCategory: toys.subCategory,
        price: toys.price,
        rating: toys.rating,
        description: toys.detailDescription,
        email: toys.email,
        quantity: toys.availableQuantity
      }
      const result = await allToysCollection.insertOne(query)
      res.send(result)
    })


    // all toys

  






    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } finally {


  }
}
run().catch(console.dir);

app.get('/', async (req, res) => {
  res.send("hello bro")
})




app.listen(port, () => {
  console.log(port, `server is running`);
})

///////