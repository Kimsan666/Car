const express = require("express");
const cors = require("cors");
const app = express();
const morgan = require("morgan");
const { readdirSync } = require("fs");


app.use(express.json({limit: '20mb'}));
app.use(morgan('dev'))
app.use(cors())

readdirSync("./routes").map((iteminroutes) => {
    app.use("/api", require("./routes/" + iteminroutes));
});


app.listen(5000, () => {
  console.log("Server is running on port 5000");
});