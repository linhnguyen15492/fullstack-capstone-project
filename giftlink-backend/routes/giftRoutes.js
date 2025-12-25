const express = require("express");
const connectToDatabase = require("../models/db");
const logger = require("../logger");
const router = express.Router();

const collection_name = "gifts";

router.get("/", async (req, res) => {
  logger.info("/ called");

  try {
    // Task 1: Connect to MongoDB and store connection to db constant
    const db = await connectToDatabase();

    // Task 2: use the collection() method to retrieve the gift collection
    const collection = db.collection(collection_name);

    // Task 3: Fetch all gifts using the collection.find method. Chain with toArray method to convert to JSON array
    const gifts = await collection.find({}).toArray();

    // Task 4: return the gifts using the res.json method
    return res.status(200).json(gifts);
  } catch (e) {
    logger.console.error("Error fetching gifts:", e);
    return res.status(500).send("Error fetching gifts");
  }
});

router.get("/:id", async (req, res) => {
  try {
    // Task 1: Connect to MongoDB and store connection to db constant
    const db = connectToDatabase();

    // Task 2: use the collection() method to retrieve the gift collection
    const collection = db.collection(collection_name);

    const id = req.params.id;

    // Task 3: Find a specific gift by ID using the collection.fineOne method and store in constant called gift
    let gift = await collection.findOne({ _id: id });

    if (!gift) {
      return res.status(404).send("Gift not found");
    }

    return res.status(200).json(gift);
  } catch (e) {
    console.error("Error fetching gift:", e);
    return res.status(500).send("Error fetching gift");
  }
});

// Add a new gift
router.post("/", async (req, res, next) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection(collection_name);
    const gift = await collection.insertOne(req.body);

    return res.status(201).json(gift.ops[0]);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
