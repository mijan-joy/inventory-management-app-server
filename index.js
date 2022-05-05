const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gxu7n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

async function run() {
    try {
        await client.connect();
        const itemsCollection = client.db("pswms").collection("items");
        console.log("db connected");

        //get items
        app.get("/inventory", async (req, res) => {
            const query = {};
            const display = parseInt(req.query.display);
            let result;
            if (display) {
                result = itemsCollection.find(query).limit(display);
            } else {
                result = itemsCollection.find(query);
            }
            const items = await result.toArray();
            res.status(200).send(items);
        });

        //get single item with id
        app.get("/inventory/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const item = await itemsCollection.findOne(query);
            res.status(200).send(item);
        });

        // Update data

        app.put("/inventory/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: req.body,
            };
            const result = await itemsCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            res.send(result);
        });

        //delete
        app.delete("/inventory/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await itemsCollection.deleteOne(query);
            res.status(200).send(result);
        });
    } finally {
    }
}

app.get("/", (req, res) => {
    res.send("> ps-wms server is running...");
});

app.listen(port, () => {
    console.log("> server is running at port no: ", port);
});

run().catch(console.dir);
