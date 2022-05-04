const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

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
        app.get("/items", async (req, res) => {
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
