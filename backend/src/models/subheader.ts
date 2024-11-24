import mongoose from "mongoose";

const SubheaderSchema = new mongoose.Schema({
    headersRef: { type: mongoose.Schema.Types.ObjectId, ref: "Header" },
    title: { type: String },
    order: { type: Number, default: 0 },
    buttons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Button" }],
  });

export const Subheader = mongoose.model("Subheader", SubheaderSchema);
