/*jshint esversion: 8 */

// Import necessary packages
const express = require('express')
const app = express()
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const connectToDatabase = require('../models/db')
const router = express.Router()
const dotenv = require('dotenv')
const pino = require('pino') // Import Pino logger

// Create a Pino logger instance
const logger = pino() // Create a Pino logger instance

dotenv.config()

const { body, validationResult } = require('express-validator')

// Create JWT secret
const JWT_SECRET = process.env.JWT_SECRET
const collection_name = 'users'

router.post('/register', async (req, res) => {
  try {
    // Connect to `giftsdb` in MongoDB through `connectToDatabase` in `db.js`
    const db = await connectToDatabase()

    // Access MongoDB collection
    const collection = db.collection(collection_name)

    // Check for existing email
    const existingEmail = await collection.findOne({ email: req.body.email })

    if (existingEmail) {
      logger.error('Email id already exists')
      return res.status(400).json({ error: 'Email id already exists' })
    }

    const salt = await bcryptjs.genSalt(10)
    const hash = await bcryptjs.hash(req.body.password, salt)
    const email = req.body.email

    // Save user details in database
    const newUser = await collection.insertOne({
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: hash,
      createdAt: new Date(),
    })

    // Create JWT authentication with user._id as payload
    const payload = {
      user: {
        id: newUser.insertedId,
      },
    }

    const authtoken = jwt.sign(payload, JWT_SECRET)
    logger.info('User registered successfully')
    return res.status(201).json({ authtoken, email })
  } catch (e) {
    return res.status(500).send('Internal server error')
  }
})

router.post('/login', async (req, res) => {
  try {
    // Connect to `giftsdb` in MongoDB through `connectToDatabase` in `db.js`.
    const db = await connectToDatabase()

    // Access MongoDB `users` collection
    const collection = db.collection(collection_name)

    // Check for user credentials in database
    const existingUser = await collection.findOne({ email: req.body.email })
    console.log(existingUser)

    // Check if the password matches the encrypyted password and send appropriate message on mismatch
    if (existingUser) {
      const passwordMatch = await bcryptjs.compare(
        req.body.password,
        existingUser.password
      )

      if (!passwordMatch) {
        logger.error('Invalid credentials')
        return res.status(401).send('Invalid credentials')
      }

      // Fetch user details from database
      const userName = existingUser.firstName
      const userEmail = existingUser.email

      // Create JWT authentication if passwords match with user._id as payload
      let payload = {
        user: {
          id: existingUser._id.toString(),
        },
      }

      const authtoken = jwt.sign(payload, JWT_SECRET)
      logger.info('User logged in successfully')
      return res.status(200).json({ authtoken, userName, userEmail })
    } else {
      // Send appropriate message if user not found
      logger.error('User not found')
      return res.status(404).json({ error: 'User not found' })
    }
  } catch (e) {
    return res.status(500).send('Internal server error')
  }
})

router.put('/update', async (req, res) => {
  // Validate the input using `validationResult` and return approiate message if there is an error.
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    logger.error('Validation errors in update request', errors.array())
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    // Check if `email` is present in the header and throw an appropriate error message if not present.
    const email = req.headers.email

    if (!email) {
      logger.error('Email not found in the request headers')
      return res
        .status(400)
        .json({ error: 'Email not found in the request headers' })
    }

    // Connect to MongoDB
    const db = await connectToDatabase()
    const collection = db.collection('users')

    // find user credentials in database
    const existingUser = await collection.findOne({ email })

    if (!existingUser) {
      logger.error('User not found')
      return res.status(404).json({ error: 'User not found' })
    }

    // const passwordMatch = await bcryptjs.compare(
    //   req.body.oldPassword,
    //   existingUser.password
    // )

    existingUser.firstName = req.body.name
    existingUser.updatedAt = new Date()

    // update user credentials in database
    const updatedUser = await collection.findOneAndUpdate(
      { email },
      { $set: existingUser },
      { returnDocument: 'after' }
    )

    // create JWT authentication using secret key from .env file
    const payload = {
      user: {
        id: updatedUser._id.toString(),
      },
    }

    const authtoken = jwt.sign(payload, JWT_SECRET)
    logger.info('User updated successfully')
    return res.status(200).json({ authtoken })
  } catch (e) {
    logger.error('Error updating user', e)
    return res.status(500).send('Internal server error')
  }
})

module.exports = router
