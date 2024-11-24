import mongoose from "mongoose";

const ButtonSchema = new mongoose.Schema({
    headerRef: { type: mongoose.Schema.Types.ObjectId, ref: "Header" },
    subheaderRef: { type: mongoose.Schema.Types.ObjectId, ref: "Subheader" },
    displayText: { type: String, required: true },
    onRightClickOutput: { type: String },
    leftClickSubOptions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Button" },
    ],
    rightClickSubOptions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Button" },
    ],
    onLeftClickOutput: { type: String },
  });

export const Button = mongoose.model("Button", ButtonSchema);
