const express = require("express");
const auth = require("../middleware/authMiddleware");
const { summarizeGroup } = require("../controllers/aiController");

const router = express.Router();

router.post("/group/:groupId", auth, summarizeGroup);

module.exports = router;
