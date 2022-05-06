const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");

// Middleware
app.use(cors());
app.use(express.json());

function verifyAuthToken(req, res, next) {
    const authHeader = req.headers?.authorization;
    console.log("from verify token", authHeader);
    if (!authHeader) {
        return res.status(401).send({ message: "Unauthorized Access" });
    }
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.SECRET_KEY, (error, decoded) => {
        if (error) {
            return res.status(403).send({ message: "Access Denied" });
        }
        console.log("decoded", decoded);
        req.decoded = decoded;
        next();
    });
}

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

        app.post("/login", async (req, res) => {
            const user = req.body;
            console.log("jwt user", user);
            const authToken = jwt.sign(user, process.env.SECRET_KEY, {
                expiresIn: "7d",
            });
            res.send({ authToken });
        });

        //get items
        app.get("/inventory", async (req, res) => {
            const query = {};
            const display = parseInt(req.query.display);
            console.log("display", display);
            let result;
            if (display) {
                result = itemsCollection.find(query).limit(display);
            } else {
                result = itemsCollection.find(query);
            }
            const items = await result.toArray();
            res.status(200).send(items);
        });

        app.get("/inventory/myitems", verifyAuthToken, async (req, res) => {
            const requestedEmail = req.decoded.email;
            const email = req.query.email;
            if (requestedEmail === email) {
                const query = { email: email };
                const result = itemsCollection.find(query);
                const items = await result.toArray();
                res.status(200).send(items);
            } else {
                res.status(403).send({ message: "Bad Request" });
            }
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

        //add or post data
        app.post("/inventory/manage/add", async (req, res) => {
            const doc = req.body;
            console.log(doc);
            const result = await itemsCollection.insertOne(doc);
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
