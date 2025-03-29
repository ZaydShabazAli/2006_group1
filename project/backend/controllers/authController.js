const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.registerUser = async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, email, phone, hashedPassword], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error saving user' });
      }
      res.json({ message: 'User registered successfully!' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
