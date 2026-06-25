const pool = require('../config/db');

// 1. Create a New Journal Entry (Protected - Requires Auth)
exports.createJournal = async (req, res) => {
  try {
    // Make sure 'title' is spelled exactly like this inside the curly braces
    const { title, content, media_url, latitude, longitude } = req.body;

    if (!title || !latitude || !longitude) {
      return res.status(400).json({ error: "Title, Latitude, and Longitude are required!" });
    }

    // req.userId comes from the auth middleware
    const query = `
      INSERT INTO journals (user_id, title, content, media_url, location)
      VALUES ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($5, $6), 4326))
      RETURNING *;
    `;
    const values = [req.userId, title, content, media_url, longitude, latitude];
    const newJournal = await pool.query(query, values);

    res.status(201).json(newJournal.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Get All Journals (Public - Anyone can view, includes creator's email)
exports.getAllJournals = async (req, res) => {
  try {
    // Using SQL INNER JOIN to get the email of the user who created the pin
    const query = `
  SELECT j.id, j.user_id, j.title, j.content, j.media_url, j.created_at,
         u.name as creator_name, -- 👈 Get the name instead of email
         ST_Y(j.location::geometry) as latitude,
         ST_X(j.location::geometry) as longitude
  FROM journals j
  INNER JOIN users u ON j.user_id = u.id;
`;
    const journals = await pool.query(query);
    res.status(200).json(journals.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Update/Edit a Journal Entry (Protected - Only the owner can edit)
exports.updateJournal = async (req, res) => {
  try {
    const { id } = req.params; // Journal ID from URL params
    const { title, content, media_url, latitude, longitude } = req.body;

    // First, check if the journal belongs to the logged-in user
    const checkQuery = `SELECT * FROM journals WHERE id = $1;`;
    const journalCheck = await pool.query(checkQuery, [id]);

    if (journalCheck.rows.length === 0) {
      return res.status(404).json({ error: "Journal not found" });
    }

    // Check if the current user is the actual owner
    if (journalCheck.rows[0].user_id !== req.userId) {
      return res.status(403).json({ error: "Unauthorized! You can only edit your own pins." });
    }

    // Update the journal details
    const updateQuery = `
      UPDATE journals 
      SET title = $1, content = $2, media_url = $3, location = ST_SetSRID(ST_MakePoint($4, $5), 4326)
      WHERE id = $6 RETURNING *;
    `;
    const values = [title, content, media_url, longitude, latitude, id];
    const updatedJournal = await pool.query(updateQuery, values);

    res.status(200).json(updatedJournal.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Proximity Search (Public - Anyone can search nearby pins)
exports.getNearbyJournals = async (req, res) => {
  try {
    const { lat, lng, distanceKm } = req.query;
    const query = `
  SELECT j.id, j.user_id, j.title, j.content, j.media_url, 
         u.name as creator_name, -- 👈 Get the name instead of email
         ST_Y(j.location::geometry) as latitude,
         ST_X(j.location::geometry) as longitude
  FROM journals j
  INNER JOIN users u ON j.user_id = u.id
  WHERE ST_DWithin(j.location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3 * 1000);
`;
    const journals = await pool.query(query, [lng, lat, distanceKm]);
    res.status(200).json(journals.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};