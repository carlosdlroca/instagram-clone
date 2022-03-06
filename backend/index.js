require("dotenv").config();

const express = require("express");
const app = express();

const PORT = process.env.PORT || 8081;



app.listen(PORT, () => console.log(`Server starting on PORT ${PORT}`));