const bookController = require('../controllers/book');

const router = require('express').Router();

router.get('/checkAvailability', bookController.checkAvailability);

router.post('/getCharges', bookController.getCharges);

module.exports = router;
