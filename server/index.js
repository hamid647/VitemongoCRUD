// backend/index.js

require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

connectDB();

// Define User model
const User = mongoose.model('users', new mongoose.Schema({}, { strict: false }));

// GET all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({});
    // Convert MongoDB Extended JSON to plain IDs
    const plainUsers = users.map(user => ({
      ...user._doc,
      _id: user._id.toString()
    }));
    res.json(plainUsers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST create user
app.post('/api/users', async (req, res) => {
  const { name, email, verified } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and Email are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const newUser = new User({
      name,
      email,
      verified: verified === true || verified === 'true',
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT update user
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, verified } = req.body;

  if (!id || id === 'undefined') {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and Email are required' });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        name,
        email,
        verified: verified === true || verified === 'true',
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE user
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;

  if (!id || id === 'undefined') {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});