const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 1. Sign Up Logic
exports.signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body; // Destructure name from request body
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    // Securely hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert name along with email and password
    const query = `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email;`;
    const newUser = await pool.query(query, [name, email, hashedPassword]);

    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: "Email already exists" });
    res.status(500).json({ error: err.message });
  }
};

// 2. Sign In Logic
exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const query = `SELECT * FROM users WHERE email = $1;`;
    const user = await pool.query(query, [email]);

    if (user.rows.length === 0) return res.status(400).json({ error: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) return res.status(400).json({ error: "Invalid Credentials" });

    const token = jwt.sign({ userId: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    // Return token, user id, email, and name to the frontend
    res.json({ 
      token, 
      user: { id: user.rows[0].id, name: user.rows[0].name, email: user.rows[0].email } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};