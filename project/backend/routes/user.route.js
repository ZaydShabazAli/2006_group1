import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';  // MySQL connection

const router = express.Router();

// POST: /api/users/signup - Route to sign up a new user
router.post('/signup', async (req, res) => {
    try {
      console.log(req.body);
      const { name, email, phone, password } = req.body;
      if (!name || !email || !phone || !password) {
        return res.status(400).json({ msg: "All fields are required." });
      }
  
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          console.error('Password hashing error:', err);
          return res.status(500).json({ msg: "Password hashing error." });
        }
  
        const sql = "INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)";
        db.query(sql, [name, email, phone, hashedPassword], (err, result) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ msg: "Database error." });
          }
          res.status(201).json({ msg: "User registered successfully!" });
        });
      });
    } catch (error) {
      console.error('Unexpected server error:', error);
      res.status(500).json({ msg: "Server error" });
    }
  });
  



// POST: /api/users/login - Route to log in a user
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    try {
        const sql = 'SELECT * FROM users WHERE email = ?';
        db.query(sql, [email], async (err, result) => {
            if (err) {
                return res.status(500).json({ msg: 'Error checking user', error: err.message });
            }

            if (result.length === 0) {
                return res.status(400).json({ msg: 'User not found' });
            }

            // Compare the hashed password
            const user = result[0];
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ msg: 'Invalid credentials' });
            }

            // Create a JWT token
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

            // Send the token to the client
            res.json({ token, msg: 'Login successful' });
        });
    } catch (error) {
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
});

export default router;
