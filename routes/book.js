const { executeQuery } = require('../datasources/postgres');
const bookController = require('../controllers/book');

const router = require('express').Router();

router.get('/checkAvailability', bookController.checkAvailability);

module.exports = router;
