const express = require("express");
const app = express();
const port = 8080;
app.listen(port, () => console.log(`Listening at ${port}`));
app.use(express.static(__dirname + "/docs"));