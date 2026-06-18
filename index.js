const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const applicantsCollection = db.collection('applicants');
    const plansCollection = db.collection('plans')
    const subscriptionCollection = db.collection('subscriptions')
    const userCollection = db.collection('user')
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    app.post('/api/jobs', async(req, res) => {
        const jobs = req.body
        const createdJobs = {
          ...jobs,
          createdAt :  new Date()
        }
        const result = await jobsCollection.insertOne(createdJobs)
        res.json(result)
    });

    app.post('/api/subscriptions', async (req, res) => {
  const subscriptions = req.body;

  const createdSubscription = {
    ...subscriptions,
    createdAt: new Date(),
  };

  await subscriptionCollection.insertOne(createdSubscription);

  const filter = {
    email: subscriptions.email,
  };

  const updateDocument = {
    $set: {
      plan: subscriptions.planId,
    },
  };

  const updatedResult = await userCollection.updateOne(
    filter,
    updateDocument
  );

  res.json(updatedResult);
});

    app.get('/api/jobs', async(req, res)=> {
    const result = await jobsCollection.find().toArray()
    res.json(result)
   });
    app.post('/api/companies', async(req, res) => {
        const company = req.body
        const createdCompanies = {
          ...company,
          createdAt : new Date()
        }
        const result = await companyCollection.insertOne(createdCompanies)
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
   });

   app.patch('/api/companies/:id', async (req, res)=> {
    const id = req.params;
    const updateCompany = req.body;
    const filter = {_id : new ObjectId(id)}
    const updateDoc = {
      $set : {
        status : updateCompany.status
      }
    }
    const result = await companyCollection.updateOne(filter, updateDoc)
    res.json(result)
   })

   app.get('/api/my/jobs', async (req, res)=> {
    const query = {};
    if(req.query.companyId) {
      query.companyId = req.query.companyId
    };
    if (req.query.status) {
      query.status = req.query.status
    }
    console.log(query)
   const result = await jobsCollection.find(query).toArray();
   res.json({
  success: true,
  data: result,
});
   });
   app.get('/api/my/jobs/:id', async (req, res) => {
    const id = req.params.id
    const query = {
      _id : new ObjectId(id)
    }
    const result = await jobsCollection.findOne(query)
    res.json(result)
   })
   app.get('/api/companies/:id', async (req, res) => {
    const id = req.params.id
    const query = {
      _id : new ObjectId(id)
    }
    const result = await companyCollection.findOne(query)
    res.json(result)
   });

   app.post('/api/applicants', async(req, res) => {
        const applicants = req.body
        const createdApplicants = {
          ...applicants,
          createdAt :  new Date()
        }
        const result = await applicantsCollection.insertOne(createdApplicants)
        res.json(result)
    });
    app.get('/api/applicants', async(req, res)=> {
      const query = {}
      if (req.query.applicantId) {
        query.applicantId = req.query.applicantId
      }
      if (req.query.jobId) {
        query.jobId =  req.query.jobId
      }
    const result = await applicantsCollection.find(query).toArray()
    res.json(result)
   });

   app.get('/api/plans',async (req, res)=> {
    const query = {}
    if(req.query.plan_id) {
      query.id = req.query.plan_id
    }
    const result = await plansCollection.findOne(query)
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
