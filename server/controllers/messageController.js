const Message = require("../models/Message");
const Item = require("../models/Item");

exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;

    const item = await Item.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.postedBy.toString() === req.user.id.toString()) {
      return res.status(400).json({ message: "Cannot message yourself" });
    }

    const newMessage = await Message.create({
      item: item._id,
      sender: req.user._id,
      receiver: item.postedBy,
      message,
    });

    res.status(201).json(newMessage);
  } catch (error) {
  console.log("MESSAGE ERROR:", error);
  res.status(500).json({ message: error.message });
}
};
/*Og fnctn in gallery pls use that if crash */
exports.getMessagesForUser = async (req, res) => {
  try {
    const messages = await Message.find({
      receiver: req.user.id
    })
      .populate("sender", "name email")
      .populate("item", "title")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
