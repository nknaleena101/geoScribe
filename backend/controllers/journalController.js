const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 3. Create a New Journal Entry
exports.createJournal = async (req, res) => {
  try {
    const { title, content, media_url, latitude, longitude } = req.body;

    const query = `
      INSERT INTO journals (user_id, title, content, media_url, location)
      VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326))
      RETURNING *, ST_AsText(location) as location_text;
    `;

    const values = [req.userId, title, content, media_url, longitude, latitude];
    const newJournal = await pool.query(query, values);

    res.status(201).json(newJournal.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  if (!title || !latitude || !longitude) {
    return res.status(400).json({ error: "Title, Latitude, and Longitude are required!" });
  }
};

// 4. Get All Journals
exports.getAllJournals = async (req, res) => {
  try {
    const query = `SELECT id, title, content, media_url, ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude FROM journals WHERE user_id = $1;`;
    const journals = await pool.query(query, [req.userId]);
    res.status(200).json(journals.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. Proximity Search: Find within X kilometers (PostGIS Flex!)
exports.getNearbyJournals = async (req, res) => {
  try {
    const { lat, lng, distanceKm } = req.query;

    if (!lat || !lng || !distanceKm) {
      return res.status(400).json({ error: "Latitude, Longitude, and Distance are required!" });
    }

    const query = `
      SELECT id, title, content, media_url,
             ST_Y(location::geometry) as latitude,
             ST_X(location::geometry) as longitude
      FROM journals
      WHERE ST_DWithin(
        location,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        $3 * 1000
      ) AND user_id = $4;
    `;

    const values = [lng, lat, distanceKm, req.userId];
    const journals = await pool.query(query, values);
    
    res.status(200).json(journals.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 6. Delete a Journal Entry
exports.deleteJournal = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteQuery = `DELETE FROM journals WHERE id = $1 RETURNING *;`;
    const result = await pool.query(deleteQuery, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Journal entry not found!" });
    }

    res.status(200).json({ message: "Journal entry deleted successfully!", deletedJournal: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// 7. Update a Journal Entry Description/Title
exports.updateJournal = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const updateQuery = `
      UPDATE journals 
      SET title = $1, content = $2 
      WHERE id = $3 
      RETURNING *;
    `;

    const result = await pool.query(updateQuery, [title, content, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Journal entry not found!" });
    }

    res.status(200).json({ message: "Journal updated successfully!", updatedJournal: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};