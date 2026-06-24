const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const journalRoutes = require('./routes/journalRoutes');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', journalRoutes);

// Database Table Auto-Initialization
const initDB = async () => {
  const createTablesQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS journals (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE, -- User කෙනෙක් අයින් කලොත් journals අයින් වෙන්න
      title VARCHAR(255) NOT NULL,
      content TEXT,
      media_url TEXT,
      location GEOGRAPHY(Point, 4326),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(createTablesQuery);
    console.log("PostgreSQL Tables Ready with Auth support.");
  } catch (err) {
    console.error("Error creating tables:", err);
  }
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await initDB();
  console.log(`Server running on port ${PORT}`);
});