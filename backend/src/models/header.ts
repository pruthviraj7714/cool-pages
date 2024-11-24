import mongoose from "mongoose";

const HeaderSchema = new mongoose.Schema({
    pageRef: { type: mongoose.Schema.Types.ObjectId, ref: "Page" },
    title: { type: String },
    order: { type: Number, default: 0 },
    subheaders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subheader" }],
    buttons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Button" }],
  });

export const Header = mongoose.model("Header", HeaderSchema);
