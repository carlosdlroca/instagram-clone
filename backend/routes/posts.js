require("dotenv").config();
const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const crypto = require("crypto");
const pool = require("../dbPool");


// Get a specific post
router.get("/:post_id", async (req, res) => {
    try {
        const [post] = await executeSQL("SELECT * FROM Post WHERE post_id = ?", [req.params.post_id]);
        res.status(200).json(post);
    } catch(err) {
        return res.status(400).json({message: "Something Went Wrong"});
    }
});

// Create a post
router.post("/", authenticateToken, async (req, res) => {
    const {user_id} = req.user;
    const {post_image_url, post_description} = req.body;

    const post_id = crypto.randomUUID();
    try {
        await executeSQL("INSERT INTO Post (post_id, post_owner, post_image_url, post_description) VALUES (?, ?, ?, ?)", [post_id, user_id, post_image_url, post_description]);
        const [post] = await executeSQL("SELECT * FROM Post WHERE post_id = ?", [post_id]);
        return res.status(201).json(post);
    } catch(err) {
        return res.status(400).json({message: "Could Not Create Post"});
    }

});

// Get List of users that have liked a post
router.get("/:post_id/likes", async (req, res) => {
    try {
        const users_that_liked_this_post = await executeSQL("SELECT * FROM Likes WHERE post_id = ?" , [req.params.post_id]);
        res.status(200).json(users_that_liked_this_post);
    } catch(err) {
        return res.status(400).json({message: "Something went wrong!"})
    }
})

// User Likes/Unlikes a post
router.post("/:post_id/likes", authenticateToken, async (req, res) => {
    const {user_id} = req.user;
    const {post_id} = req.params;

    try {
        // Check if user had liked the post already
        const liked = await executeSQL("SELECT * FROM Likes WHERE post_id = ? AND user_id = ?", [post_id, user_id]);
        
        if(liked.length < 1) {
            // User has not LIKED the Post yet
            await executeSQL("INSERT INTO Likes (post_id, user_id) VALUES (?,?)", [post_id, user_id]);
            return res.status(200).json({message: "Successfully Liked the post", liked: true});
        } else {
            // User wants to UNLIKE the Post
            await executeSQL("DELETE FROM Likes WHERE post_id = ? AND user_id = ?", [post_id, user_id]);
            return res.status(200).json({message: "Successfully uliked the post", liked: false});
        }

        
    } catch(err) {
        return res.status(400).json({message: "Something went wrong!"})
    }
});

// Get all Comments under a post
router.get("/:post_id/comments", async (req, res) => {
    try {
        const post_comments = await executeSQL("SELECT * FROM Comments WHERE post_id = ? ORDER BY created_at DESC", [req.params.post_id]);
        return res.status(200).json(post_comments);
    } catch(err) {
        return res.status(400).json({message: "Could not retreive comment!"});
    }
});

// Post comment under a post
router.post("/:post_id/comments", authenticateToken, async (req, res) => {
    const {user_id} = req.user;
    const {comment_body} = req.body;
    // Create Comment ID
    const comment_id = crypto.randomUUID();
    try {
        await executeSQL("INSERT INTO Comments (comment_id, post_id, user_id, comment_body) VALUES (?,?,?,?)", [comment_id, req.params.post_id, user_id, comment_body]);
        const [comment] = await executeSQL("SELECT * FROM Comments WHERE comment_id = ?", [comment_id]);

        return res.status(201).json(comment);
    } catch(err) {
        return res.status(400).json({message: "Could not create Comment"});
    }
});

// User Updates comment under post
router.patch("/:post_id/comments/:comment_id", authenticateToken, async (req, res) => {
    const { user_id } = req.user;
    const { comment_body } = req.body;
    const { comment_id } = req.params;

    try {
        // Find the Comment we went to edit
        const [ comment ] = await executeSQL("SELECT * FROM Comments WHERE comment_id = ? AND user_id = ?", [comment_id, user_id]);
        if(comment && comment.user_id == user_id) {
            await executeSQL("UPDATE Comments SET comment_body = ? WHERE comment_id = ?", [comment_body, comment_id]);
            return res.status(201).json({message: "Comment successfully updated!"});
        } else {
            return res.status(401).json({message: "This is not your comment"})
        }
    } catch(err) {
        return res.status(404).json({message: "Comment not found"});
    }
});

// Delete Comment
router.delete("/:post_id/comments/:comment_id", authenticateToken, async (req, res) => {
    const {user_id} = req.user;
    const { comment_id } = req.params;

    try {
        const [ comment ] = await executeSQL("SELECT * FROM Comments WHERE comment_id = ? AND user_id = ?", [comment_id, user_id]);
        if(comment && comment.user_id == user_id) {
            // User owns the comment, we can delete it
            await executeSQL("DELETE FROM Comments WHERE comment_id = ?", [comment_id]);
            return res.status(204).send();
        }
        return res.status(401).json({message: "You cannot delete this comment"});
    } catch(err) {
        return res.status(400).json({message: "Could not delete this comment!"});
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