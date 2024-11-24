import mongoose from "mongoose";

mongoose
  .connect('mongodb://localhost:27017/backend')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });