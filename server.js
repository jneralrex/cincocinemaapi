const express = require("express");
const { config } = require("./config/config");
const connectDB = require("./config/connectDB");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes");
const locationRoutes = require("./routes/location.routes");
const helmet = require('helmet');
const classRoutes = require('./routes/classRoutes')
const rowRoutes = require('./routes/rowRoutes')
const screenRoutes = require("./routes/screen.routes");
const adsRoutes = require("./routes/ads.routes");
const likeRoutes = require("./routes/likes.routes");
const userRoutes = require("./routes/user.routes");
const movieRouter = require("./routes/movie.routes");
const reviewRoutes = require("./routes/reviews.routes");
const airingDateRoutes = require("./routes/date.routes");
const airingTimeRoutes = require("./routes/time.routes");
const aboutRoutes = require('./routes/aboutUs.routes')
const cronJobs = require("./utils/cron.utils");
const cors = require("cors");
const path = require("path");
const seatRoutes = require('./routes/seatRoutes');
const theatreRoutes = require("./routes/theatre.routes");
const reportRoutes = require("./routes/report.routes");
const eventRoutes = require("./routes/event.routes");
const cinemaRoutes = require("./routes/cinema.routes");
const commentsRoutes = require("./routes/comment.routes");
const app = express();
const port = config.port


connectDB();
cronJobs();

const allowedOrigins = [
  config.front_end_url_1, 
  config.front_end_url_2,
  config.front_end_url_3,
  config.front_end_url_4,
  'http://localhost:5173', 
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true, 
};

app.use(cors(corsOptions));
app.use('/uploads',express.static(path.join(__dirname, "uploads")));
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
app.use("/api/v1/movies", movieRouter); 
app.use("/api/v1/about", aboutRoutes)
app.use("/api/v1/likes", likeRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/review", reviewRoutes);
app.use("/api/v1/class", classRoutes);
app.use("/api/v1/row", rowRoutes);
app.use("/api/v1/airingdate", airingDateRoutes);
app.use("/api/v1/airingtime", airingTimeRoutes);
app.use("/api/v1/seat",seatRoutes );
app.use("/api/v1/theatre",theatreRoutes );
app.use("/api/v1/report",reportRoutes);
app.use("/api/v1/event",eventRoutes);
app.use("/api/v1/cinema",cinemaRoutes);
app.use("/api/v1/comment",commentsRoutes);



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
