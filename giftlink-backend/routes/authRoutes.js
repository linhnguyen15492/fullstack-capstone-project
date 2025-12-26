//Step 1 - Task 2: Import necessary packages
const express = require("express");
const app = express();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const connectToDatabase = require("../models/db");
const router = express.Router();
const dotenv = require("dotenv");
const pino = require("pino"); // Import Pino logger

//Step 1 - Task 3: Create a Pino logger instance
const logger = pino(); // Create a Pino logger instance

dotenv.config();

//Step 1 - Task 4: Create JWT secret
const JWT_SECRET = process.env.JWT_SECRET;
const collection_name = "users";

router.post("/register", async (req, res) => {
  try {
    // Task 1: Connect to `giftsdb` in MongoDB through `connectToDatabase` in `db.js`
    const db = await connectToDatabase();

    // Task 2: Access MongoDB collection
    const collection = db.collection(collection_name);

    //Task 3: Check for existing email
    const existingEmail = await collection.findOne({ email: req.body.email });

    if (existingEmail) {
      logger.error("Email id already exists");
      return res.status(400).json({ error: "Email id already exists" });
    }

    const salt = await bcryptjs.genSalt(10);
    const hash = await bcryptjs.hash(req.body.password, salt);
    const email = req.body.email;

    //Task 4: Save user details in database
    const newUser = await collection.insertOne({
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: hash,
      createdAt: new Date(),
    });

    //Task 5: Create JWT authentication with user._id as payload
    const payload = {
      user: {
        id: newUser.insertedId,
      },
    };

    const authtoken = jwt.sign(payload, JWT_SECRET);
    logger.info("User registered successfully");
    return res.status(201).json({ authtoken, email });
  } catch (e) {
    return res.status(500).send("Internal server error");
  }
});

router.post("/login", async (req, res) => {
  try {
    // Task 1: Connect to `giftsdb` in MongoDB through `connectToDatabase` in `db.js`.
    const db = await connectToDatabase();

    // Task 2: Access MongoDB `users` collection
    const collection = db.collection(collection_name);

    // Task 3: Check for user credentials in database
    const existingUser = await collection.findOne({ email: req.body.email });
    console.log(existingUser);

    // Task 4: Task 4: Check if the password matches the encrypyted password and send appropriate message on mismatch
    if (existingUser) {
      const passwordMatch = await bcryptjs.compare(
        req.body.password,
        existingUser.password
      );

      if (!passwordMatch) {
        logger.error("Invalid credentials");
        return res.status(401).send("Invalid credentials");
      }

      // Task 5: Fetch user details from database
      const userName = existingUser.firstName;
      const userEmail = existingUser.email;

      // Task 6: Create JWT authentication if passwords match with user._id as payload
      let payload = {
        user: {
          id: existingUser._id.toString(),
        },
      };
      const authtoken = jwt.sign(payload, JWT_SECRET);
      logger.info("User logged in successfully");
      return res.status(200).json({ authtoken, userName, userEmail });
    } else {
      // Task 7: Send appropriate message if user not found
      logger.error("User not found");
      return res.status(404).json({ error: "User not found" });
    }
  } catch (e) {
    return res.status(500).send("Internal server error");
  }
});

module.exports = router;
