const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { createItem, getItems, getItemById, deleteItem, updateItem } = require("../controllers/itemController");
const upload = require("../middleware/uploadMiddleware");

router.post("/", protect, upload.single("image"), createItem);
// Protected route
router.post("/", protect, createItem);

// Public route
router.get("/", getItems);
router.get("/:id", getItemById);
router.delete("/:id", protect, deleteItem);
router.put("/:id", protect, updateItem);
module.exports = router;