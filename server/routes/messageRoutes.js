const express = require("express");
const router = express.Router();
const { sendMessage, getMessagesForUser } = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

router.post("/:itemId", protect, sendMessage);
router.get("/", protect, getMessagesForUser);

module.exports = router;