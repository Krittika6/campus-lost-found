const Item = require("../models/Item");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

exports.createItem = async (req, res) => {
  try {
    const { title, description, category, status, location } = req.body;

    let imageUrl = "";

    if (req.file) {
      const uploadStream = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "campus_lost_found" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

      const result = await uploadStream();
      imageUrl = result.secure_url;
    }

    const item = await Item.create({
      title,
      description,
      category,
      status,
      location,
      imageUrl,
      postedBy: req.user._id,
    });

    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET ALL ITEMS
exports.getItems = async (req, res) => {
  try {
    const { keyword, category, status, location, page = 1, limit = 5 } = req.query;

    let query = {};

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } }
      ];
    }

    if (category) query.category = category;
    if (status) query.status = status;
    if (location) query.location = location;

    const total = await Item.countDocuments(query);

    const items = await Item.find()
  .populate("postedBy", "name email")
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(limit);

    res.json({
      totalItems: total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      items,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
//one item
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate("postedBy", "name email");

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Check ownership or admin
    if (
      item.postedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await item.deleteOne();

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
exports.updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Ownership or admin check
    if (
      item.postedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};