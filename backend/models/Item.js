const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
{
name: {
type: String,
required: true,
trim: true
},
description: {
type: String,
default: ""
}
},
{
timestamps: true
}
);

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;