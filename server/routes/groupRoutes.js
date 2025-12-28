const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  createGroup,
  joinGroup,
  getAllGroups,
  deleteGroup
} = require("../controllers/groupController");

router.post("/", auth, createGroup);
router.post("/:id/join", auth, joinGroup);
router.get("/", auth, getAllGroups);
// ✅ ADMIN-ONLY DELETE GROUP
router.delete("/:groupId", auth, deleteGroup);

module.exports = router;
