const express = require('express');
const router = express.Router();
const { searchTransport, searchHotels, searchPackages, getPopularDestinations } = require('../controllers/searchController');

router.get('/transport', searchTransport);
router.get('/hotels', searchHotels);
router.get('/packages', searchPackages);
router.get('/destinations', getPopularDestinations);

module.exports = router;
