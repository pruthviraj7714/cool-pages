import { config } from "dotenv";
import mongoose from "mongoose";
config();

const MONGODB_URL = process.env.MONGODB_URI ?? "";

mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
