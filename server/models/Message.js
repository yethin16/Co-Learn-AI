const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    type: {
      type: String,
      enum: ["text", "file"],
      default: "text"
    },
    text: String,

    // FILE-SPECIFIC
    file: {
      originalName: String,
      mimeType: String,
      size: Number,
      extractedText: String,   // 🔥 store once, reuse forever
      summary: String          // 🔥 per-file AI summary
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
