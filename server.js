const express = require("express");
const config = require("./config/config");
const connectDB = require("./config/connectDB");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes");


const app = express()
const port = config.port
connectDB();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    const errorMessage = err.message || "Internal Server Error";
    if (err.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: errorMessage });
    };
    res.status(statusCode).json({
        success: false,
        message: errorMessage,
    });
    console.error("Error caught by errorHandler:", err);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
});