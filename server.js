const express = require("express");
const {config} = require("./config/config");
const connectDB = require("./config/connectDB");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes");
<<<<<<< HEAD
const classRoute = require('./routes/classRoutes');
const rowRoute = require('./routes/rowRoutes')
=======
const locationRoutes = require("./routes/location.routes");
const helmet = require('helmet');


>>>>>>> af0217bc83c0eca389c3fdac6d4655585cda90ba

const app = express()
const port = config.port
app.use(helmet());

connectDB();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
<<<<<<< HEAD
app.use("/api/class", classRoute);
app.use("/api/row", rowRoute);


=======
app.use("/api/location", locationRoutes);
>>>>>>> af0217bc83c0eca389c3fdac6d4655585cda90ba

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