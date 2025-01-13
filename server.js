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
const cors = require("cors");

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

const allowedOrigins = [
  config.front_end_url_1,
  config.front_end_url_2,
  "http://localhost:5173",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
};

app.use(cors(corsOptions));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/location", locationRoutes);
app.use("/api/v1/screen", screenRoutes);
app.use("/api/v1/ads", adsRoutes);
app.use("/api/v1/info", aboutInfoRoutes);

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const errorMessage = err.message || "Internal Server Error";

  if (err.name === "ValidationError") {
    return res.status(400).json({ success: false, message: errorMessage });
  }

  if (err.name === "MongoError") {
    return res
      .status(500)
      .json({ success: false, message: "Database error occurred." });
  }

  if (err.name === "ConnectionTimeOut") {
    return res
      .status(408)
      .json({ success: false, message: "Connection timeout." });
  }

  res.status(statusCode).json({
    success: false,
    message: errorMessage,
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
