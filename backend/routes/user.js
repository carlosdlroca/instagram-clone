require("dotenv").config();
const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const crypto = require("crypto");
const pool = require("../dbPool");


// Get User Info (no password)
router.get("/:user_id", async (req, res) => {
    try {
        const [user] = await executeSQL("SELECT * FROM User WHERE user_id = ?", [req.params.user_id]);
        
        if(user) {
            // User found, lets send information to display their profile
            return res.status(200).json(user);
        }
        return res.status(400).json({message: "User not found"});
    } catch(err) {
        return res.status(400).json(err);
    }
});

//Get followers of a User
router.get("/:user_id/followers", async (req, res) => {
    try {
        const followers = await executeSQL("SELECT * FROM Followers WHERE followee_id = ? ORDER BY created_at DESC", [req.params.user_id]);
        console.log(followers);
        if(followers) {
            return res.status(200).json(followers);
        }
        return res.status(404).json({message: "not found"})
    } catch(err) {
        return res.status(400).json(err);
    }
});

// Follow a user
router.post("/:user_id/followers", authenticateToken, async (req, res) => {
    const {user_id: follower_id} = req.user;
    const {user_id: followee_id} = req.params;

    // 2 Requests to DB server....
    try {
        // Make sure followee exists
        const [followee] = await executeSQL("SELECT * FROM User WHERE user_id = ?", [followee_id]);
        console.log(followee);
        if(followee) {
            // Now we can follow each other
            await executeSQL("INSERT INTO Followers (followee_id, follower_id) VALUES (?, ?)", [followee_id, follower_id]);
            return res.status(201).json({message: "Successfully followed the user"});
        }
        return res.status(404).json({message: "That user does not exist, yo!"})
    } catch(err) {
        return res.status(400).json(err);
    }
});

router.delete("/:user_id/followers", authenticateToken, async (req, res) => {
    const {user_id: follower_id} = req.user;
    const {user_id: followee_id} = req.params;

    try {
        const [followee]  = await executeSQL("SELECT * FROM User where user_id = ?", [followee_id]);
        if(followee) {
            await executeSQL("DELETE FROM Followers WHERE follower_id = ? AND followee_id = ?", [follower_id, followee_id]);
            return res.status(204).send();
        }
        return res.status(404).json({message: "User not found!"});
    } catch(err) {
        return res.status(400).json(err);
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