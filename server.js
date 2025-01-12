const express = require("express");
const { config } = require("./config/config");
const connectDB = require("./config/connectDB");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes");
const locationRoutes = require("./routes/location.routes");
const screenRoutes = require("./routes/screen.routes");
const adsRoutes = require("./routes/ads.routes");
const aboutInfoRoutes = require("./routes/aboutUs.routes");
const helmet = require("helmet");
const cronJobs = require("./utils/cron.utils");

const app = express();
const port = config.port;

connectDB();

cronJobs();

app.use(express.json());
app.use(cookieParser());
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/location", locationRoutes);
app.use("/api/v1/screen", screenRoutes);
app.use("/api/v1/ads", adsRoutes);
app.use("/api/v1/info", aboutInfoRoutes);

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const errorMessage = err.message || "Internal Server Error";

  // Handle specific errors
  if (err.name === "ValidationError") {
    return res.status(400).json({ success: false, message: errorMessage });
  }

  // Handle MongoDB connection error
  if (err.name === "MongoError") {
    return res.status(500).json({ success: false, message: "Database error occurred." });
  }

  // Handle connection timeout error
  if (err.name === "ConnectionTimeOut") {
    return res.status(408).json({ success: false, message: "Connection timeout." });
  }

  // Log the error stack for debugging
  console.error("Error caught by errorHandler:", err.stack);

  // Send a generic error response
  res.status(statusCode).json({
    success: false,
    message: errorMessage,
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
