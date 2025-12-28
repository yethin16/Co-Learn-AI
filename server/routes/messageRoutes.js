const express = require("express");
const multer = require("multer");
const auth = require("../middleware/authMiddleware");
const Message = require("../models/Message");
const {summarizeGroupMessages} = require("../controllers/messageController");


const router = express.Router();

/* ───────── FILE STORAGE ───────── */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

/* ───────── GET MESSAGES OF GROUP ───────── */

router.get("/:groupId", auth, async (req, res) => {
  const messages = await Message.find({
    group: req.params.groupId
  })
    .populate("sender", "name")
    .sort({ createdAt: 1 });

  res.json(messages);
});

/* ───────── UPLOAD FILE MESSAGE ───────── */

router.post(
  "/file/:groupId",
  auth,
  upload.single("file"),
  async (req, res) => {
    const message = await Message.create({
      group: req.params.groupId,
      sender: req.user._id,
      type: "file",
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`
    });

    res.json(message);
  }
);

router.post("/summarize/:groupId", auth, summarizeGroupMessages);

module.exports = router;
