const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');
const auth = require('../middleware/authMiddleware');

router.post('/journals', auth, journalController.createJournal);
router.get('/journals', auth, journalController.getAllJournals);
router.get('/journals/search', auth, journalController.getNearbyJournals);
router.delete('/journals/:id', journalController.deleteJournal);
router.put('/journals/:id', journalController.updateJournal);

module.exports = router;
