const express = require("express");
const multer = require("multer");
const Category = require("../models/Category");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// helper: log duration
function logApi(req, res, label) {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[API] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms ${label || ""}`);
  });
}

/* ---------------- CREATE CATEGORY ---------------- */
router.post("/", async (req, res, next) => {
  logApi(req, res, "create-category");
  try {
    const { name, parentId, price, terms, visibleToUser, visibleToVendor, freeText, seoKeywords, categoryType, addToCart} = req.body;

    if (!name) return res.status(400).json({ message: "Name is required" });

    if (!parentId) {
      const exists = await Category.findOne({ name, parent: null });
      if (exists) return res.status(400).json({ message: "Category already exists" });
    }
    if (!parentId) {
  categoryData.seoKeywords = seoKeywords || "";
}


    const parsedSequence = (() => {
      const seq = Number(req.body.sequence);
      return Number.isNaN(seq) ? 0 : seq;
    })();

    const parsedPrice = (() => {
      if (price === "" || price === undefined || price === null) return null;
      const n = Number(price);
      return Number.isNaN(n) ? null : n;
    })();


    const categoryData = {
  name,
  imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
  parent: parentId || null,
  sequence: parsedSequence,
  terms,
  visibleToUser: String(visibleToUser) === "true",
  visibleToVendor: String(visibleToVendor) === "true",
  categoryType: categoryType || "Products",
  addToCart: categoryType === "Products" ? addToCart === "true" || addToCart === true : false,

};

// Only for subcategories (parentId exists)
if (parentId) {
  categoryData.price = parsedPrice;
  categoryData.freeText = freeText || "";
}
else {
  // Only for root categories
  categoryData.seoKeywords = seoKeywords || "";
}

if (!parentId) {
  categoryData.postRequestsDeals = req.body.postRequestsDeals === "true";
  categoryData.loyaltyPoints = req.body.loyaltyPoints === "true";
  categoryData.linkAttributesPricing = req.body.linkAttributesPricing === "true";

  // 10 free texts
  categoryData.freeTexts = [];
  for (let i = 0; i < 10; i++) {
    categoryData.freeTexts.push(req.body[`freeText${i}`] || "");
  }
}


const category = new Category(categoryData);

    const saved = await category.save();
    console.log("💾 Saved category:", { id: saved._id.toString(), name: saved.name });
    res.json(saved);
  } catch (err) {
    console.error("🔥 POST /api/categories error:", err.message);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

/* ---------------- GET CATEGORIES ---------------- */
router.get("/", async (req, res, next) => {
  logApi(req, res, "list-categories");
  try {
    let { parentId } = req.query;
    parentId = parentId === "null" ? null : parentId;
    const categories = await Category.find({ parent: parentId }).sort({
      sequence: 1,
      createdAt: -1,
    });
    res.json(categories);
  } catch (err) {
    next(err);
  }
});
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, parentId, price, terms, visibleToUser, visibleToVendor } = req.body;
    if (!name) return res.status(400).json({ message: "Name required" });

    const parent = parentId && parentId !== "" ? parentId : null;

    const exists = await Category.findOne({ name, parent });
    if (exists) return res.status(400).json({ message: "Category exists under this parent" });

    const category = new Category({
      name,
      parent,
      price: price ? Number(price) : null,
      terms: terms || "",
      visibleToUser: visibleToUser === "true" || visibleToUser === true,
      visibleToVendor: visibleToVendor === "true" || visibleToVendor === true,
      imageUrl: req.file ? `/${req.file.path.replace(/\\/g, "/")}` : "",
      freeTexts: Array(10).fill(""),
    });

    await category.save();
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});


/* ---------------- UPDATE CATEGORY ---------------- */
router.put("/:id", upload.single("image"), async (req, res, next) => {
  logApi(req, res, "update-category");
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    const { name, price, terms, visibleToUser, visibleToVendor, freeText, seoKeywords, categoryType, addToCart} = req.body;

    if (name !== undefined) category.name = name;

category.terms = terms !== undefined ? terms : category.terms;
category.visibleToUser = visibleToUser === "true";
category.visibleToVendor = visibleToVendor === "true";

// Only update for subcategories
if (category.parent) {
  category.price = price === "" || price === undefined ? null : Number(price);
  category.freeText = freeText !== undefined ? freeText : category.freeText;
}
if (!category.parent && seoKeywords !== undefined) {
  category.seoKeywords = seoKeywords;
}
if (categoryType !== undefined) category.categoryType = categoryType;
if (category.categoryType === "Products") {
  category.addToCart = addToCart === "true" || addToCart === true;
} else {
  category.addToCart = false;
}

if (!category.parent) {
  category.postRequestsDeals = req.body.postRequestsDeals === "true";
  category.loyaltyPoints = req.body.loyaltyPoints === "true";
  category.linkAttributesPricing = req.body.linkAttributesPricing === "true";

  // update free texts
  category.freeTexts = [];
  for (let i = 0; i < 10; i++) {
    category.freeTexts.push(req.body[`freeText${i}`] || "");
  }
}


if (req.body.sequence !== undefined) {
  category.sequence = req.body.sequence === "" ? 0 : Number(req.body.sequence);
}

if (req.file) category.imageUrl = `/uploads/${req.file.filename}`;


    await category.save();
    res.json(category);
  } catch (err) {
    console.error("🔥 PUT /api/categories/:id error:", err.message);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

/* ---------------- DELETE CATEGORY ---------------- */
router.delete("/:id", async (req, res, next) => {
  logApi(req, res, "delete-category");
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted" });
  } catch (err) {
    next(err);
  }
});

/* ---------------- GET SINGLE CATEGORY ---------------- */
router.get("/:id", async (req, res, next) => {
  logApi(req, res, "get-category");
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (err) {
    console.error("🔥 GET /api/categories/:id error:", err.message);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

/* ---------------- DEBUG ROUTES ---------------- */
router.get("/_debug/count", async (req, res, next) => {
  logApi(req, res, "debug-count");
  try {
    const count = await Category.countDocuments({});
    const conn = require("mongoose").connection;
    res.json({
      count,
      dbName: conn.db ? conn.db.databaseName : null,
      collection: Category.collection.collectionName,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/_debug/probe", async (req, res, next) => {
  logApi(req, res, "debug-probe");
  try {
    const probeName = `__probe_${Date.now()}`;
    const saved = await Category.create({ name: probeName });
    const conn = require("mongoose").connection;
    res.json({
      saved: { id: saved._id.toString(), name: saved.name },
      dbName: conn.db ? conn.db.databaseName : null,
      collection: Category.collection.collectionName,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
