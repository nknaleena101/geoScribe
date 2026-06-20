const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');

router.post('/journals', journalController.createJournal);
router.get('/journals', journalController.getAllJournals);
router.get('/journals/search', journalController.getNearbyJournals);

module.exports = router;
