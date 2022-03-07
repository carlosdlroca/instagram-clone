require("dotenv").config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const pool = require('../dbPool');

router.post("/login", async (req, res) => {
    const {username, password} = req.body;

    try {
        const [{ password: candidatePassword, ...user }] = await executeSQL("SELECT * FROM User WHERE username = ?", [username]);
        let isMatch = await bcrypt.compare(password, candidatePassword);
        if(!isMatch) {
            return res.status(400).json({
                status: 400,
                message: "Invalid username/password"
            })
        }

        let token = jwt.sign({
            ...user
        }, process.env.JWT_ACCESS_SECRET);

        return res.status(200).json({...user, token});

    } catch(err) {
        return res.status(400).json({message: "Invalid username/password!"});
    }
});

router.post("/signup", async (req, res) => {
    const {username, password, first_name, last_name, profile_image_url } = req.body;

    try {
        let hashedPassword = await bcrypt.hash(password, 10);
        const user_id = crypto.randomUUID();
        
        await executeSQL("INSERT INTO User (user_id, username, password, first_name, last_name, profile_image_url) VALUES (?, ?, ?, ?, ?, ?)", [user_id, username, hashedPassword, first_name, last_name, profile_image_url]);

        let token = jwt.sign({
            user_id,
            username,
            first_name,
            last_name,
            profile_image_url
        }, process.env.JWT_ACCESS_SECRET);

        return res.status(201).json({
            user_id,
            username,
            profile_image_url,
            first_name,
            last_name,
            token
        });

    } catch(err) {
        let errMessage;
        if(err.errno == 1062) 
            errMessage = "Sorry. That username is taken!"
        return res.status(400).json({message: errMessage || "Something went wrong!"})
    }
});

async function executeSQL(sql, params){
    return new Promise (function (resolve, reject) {
      pool.query(sql, params, function (err, rows, fields) {
        if (err) {
           reject(err);
        };
        resolve(rows);
      });
    });
}

module.exports = router;