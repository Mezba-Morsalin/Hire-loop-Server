const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const app = express();
dotenv.config()

app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI

const port = process.env.PORT


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
    
    const db = client.db('hireloop_DB')
    const jobsCollection = db.collection('jobs');
    const companyCollection = db.collection('companies');
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    app.post('/api/jobs', async(req, res) => {
        const jobs = req.body
        const result = await jobsCollection.insertOne(jobs)
        res.json(result)
    })
    app.get('/api/jobs', async(req, res)=> {
    const result = await jobsCollection.find().toArray()
    res.json(result)
   })
    app.post('/api/companies', async(req, res) => {
        const jobs = req.body
        const result = await companyCollection.insertOne(jobs)
        res.json(result)
    })
    app.get('/api/companies', async(req, res)=> {
    const result = await companyCollection.find().toArray()
    res.json(result)
   })

   app.get('/api/my/companies', async (req, res)=> {
    const query = {};
    if(req.query.recruiterId) {
      query.recruiterId = req.query.recruiterId
    };
    const result = await companyCollection.findOne(query);
    res.json(result)
   })
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})