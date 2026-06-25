const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');
const auth = require('../middleware/authMiddleware');

// Public Routes
router.get('/journals', journalController.getAllJournals);
router.get('/journals/search', journalController.getNearbyJournals);

// Protected Routes
router.post('/journals', auth, journalController.createJournal);
router.put('/journals/:id', auth, journalController.updateJournal);

module.exports = router;