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
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS journals (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT,
      media_url TEXT,
      location GEOGRAPHY(Point, 4326),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(createTableQuery);
    console.log("PostgreSQL Table Ready with PostGIS support. 🎉");
  } catch (err) {
    console.error("Error creating table:", err);
  }
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await initDB();
  console.log(`Server running on port ${PORT}`);
});