const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location');

// Get all locations (states and cities)
router.get('/', locationController.getAllLocations);

// Get all cities (flat list)
router.get('/cities', locationController.getAllCitiesList);

// Get all states
router.get('/states', locationController.getAllStates);

// Search locations by query
router.get('/search', locationController.searchLocations);

// Get cities by state code
router.get('/state/:stateCode', locationController.getCitiesByStateCode);

module.exports = router;

