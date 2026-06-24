const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');

router.post('/journals', journalController.createJournal);
router.get('/journals', journalController.getAllJournals);
router.get('/journals/search', journalController.getNearbyJournals);
router.delete('/journals/:id', journalController.deleteJournal);
router.put('/journals/:id', journalController.updateJournal);

module.exports = router;
