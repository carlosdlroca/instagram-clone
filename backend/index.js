require("dotenv").config();

const express = require("express");
const app = express();

const mysql = require('mysql');
const pool = require("./dbPool");

const PORT = process.env.PORT || 8081;



app.listen(PORT, () => console.log(`Server starting on PORT ${PORT}`));