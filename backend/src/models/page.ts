import mongoose from "mongoose";

const ButtonSchema = new mongoose.Schema({
  displayText: { type: String },
  headerId: { type: mongoose.Schema.Types.ObjectId, ref: "Header" },
  subheaderId: { type: mongoose.Schema.Types.ObjectId, ref: "SubHeader" },
  onLeftClickOutput: { type: String },
  onRightClickOutput: { type: String },
  leftClickSubOptions: [{ type: String }],
  rightClickSubOptions: [{ type: String }],
});

const SubHeaderSchema = new mongoose.Schema({
  title: { type: String },
  order: { type: Number },
  buttons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Button" }],
});

const HeaderSchema = new mongoose.Schema({
  title: { type: String },
  order: { type: Number },
  subheaders: [{ type: mongoose.Schema.Types.ObjectId, ref: "SubHeader" }],
  buttons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Button" }],
});

const PageSchema = new mongoose.Schema({
  title: { type: String },
  headers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Header" }],
});

export const Page = mongoose.model("Page", PageSchema);
export const Header = mongoose.model("Header", HeaderSchema);
export const Button = mongoose.model("Button", ButtonSchema);
export const SubHeader = mongoose.model("SubHeader", SubHeaderSchema);
