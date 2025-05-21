require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
const userRouter = require("./routes/userRouter");

app.use(express.json());
app.use(cookieParser());

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection error:", error));

app.use(
  cors({
    origin: ["http://localhost:3000", "https://medi-connect-6ift.vercel.app"],
    credentials: true,
  })
);

app.set("trust proxy", 1);

app.use("/api", userRouter);

module.exports = app;
