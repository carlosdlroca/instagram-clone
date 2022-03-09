require("dotenv").config();

const express = require("express");
const app = express();

const authenticateToken = require("./middleware/auth");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const postsRoutes = require("./routes/posts");


const PORT = process.env.PORT || 8081;

app.use(express.json())
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/posts", postsRoutes);

app.get("/", authenticateToken, (req, res) => {
    res.send(req.user);
})



app.listen(PORT, () => console.log(`Server starting on PORT ${PORT}`));