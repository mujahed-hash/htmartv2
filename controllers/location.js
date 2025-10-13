const { indiaLocations, getAllCities, searchCities, getCitiesByState } = require('../data/indiaLocations');

/**
 * Get all states and cities
 * GET /api/locations
 */
exports.getAllLocations = (req, res) => {
    try {
        console.log('📍 getAllLocations called - no auth required');
        res.status(200).json({
            success: true,
            data: indiaLocations
        });
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch locations',
            error: error.message
        });
    }
};

/**
 * Get all cities (flat list with state info)
 * GET /api/locations/cities
 */
exports.getAllCitiesList = (req, res) => {
    try {
        const cities = getAllCities();
        res.status(200).json({
            success: true,
            count: cities.length,
            data: cities
        });
    } catch (error) {
        console.error('Error fetching cities:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cities',
            error: error.message
        });
    }
};

/**
 * Search cities by name or state
 * GET /api/locations/search?q=mumbai
 */
exports.searchLocations = (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const results = searchCities(q);
        
        res.status(200).json({
            success: true,
            count: results.length,
            query: q,
            data: results
        });
    } catch (error) {
        console.error('Error searching locations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search locations',
            error: error.message
        });
    }
};

/**
 * Get cities by state code
 * GET /api/locations/state/:stateCode
 */
exports.getCitiesByStateCode = (req, res) => {
    try {
        const { stateCode } = req.params;
        
        if (!stateCode) {
            return res.status(400).json({
                success: false,
                message: 'State code is required'
            });
        }

        const cities = getCitiesByState(stateCode);
        
        if (cities.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'State not found or has no cities'
            });
        }

        res.status(200).json({
            success: true,
            stateCode: stateCode,
            count: cities.length,
            data: cities
        });
    } catch (error) {
        console.error('Error fetching cities by state:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cities by state',
            error: error.message
        });
    }
};

/**
 * Get all states (without cities)
 * GET /api/locations/states
 */
exports.getAllStates = (req, res) => {
    try {
        const states = indiaLocations.states.map(state => ({
            name: state.name,
            code: state.code,
            cityCount: state.cities.length
        }));

        res.status(200).json({
            success: true,
            count: states.length,
            data: states
        });
    } catch (error) {
        console.error('Error fetching states:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch states',
            error: error.message
        });
    }
};

