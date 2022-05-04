const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");

// Middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("> ps-wms server is running...");
});

app.listen(port, () => {
    console.log("> server is running at port no: ", port);
});
