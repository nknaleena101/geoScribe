const pool = require('../config/db');

// 1. Create a New Journal Entry
exports.createJournal = async (req, res) => {
  try {
    const { title, content, media_url, latitude, longitude } = req.body;
    
    const query = `
      INSERT INTO journals (title, content, media_url, location)
      VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326))
      RETURNING *, ST_AsText(location) as location_text;
    `;
    
    const values = [title, content, media_url, longitude, latitude];
    const newJournal = await pool.query(query, values);
    
    res.status(201).json(newJournal.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Get All Journals
exports.getAllJournals = async (req, res) => {
  try {
    const query = `
      SELECT id, title, content, media_url, created_at,
             ST_Y(location::geometry) as latitude,
             ST_X(location::geometry) as longitude
      FROM journals;
    `;
    const journals = await pool.query(query);
    res.status(200).json(journals.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Proximity Search: Find within X kilometers (PostGIS Flex!)
exports.getNearbyJournals = async (req, res) => {
  try {
    const { lat, lng, distanceKm } = req.query;
    
    const query = `
      SELECT id, title, content, media_url,
             ST_Y(location::geometry) as latitude,
             ST_X(location::geometry) as longitude
      FROM journals
      WHERE ST_DWithin(
        location,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        $3 * 1000
      );
    `;
    
    const values = [lng, lat, distanceKm];
    const journals = await pool.query(query, values);
    res.status(200).json(journals.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};