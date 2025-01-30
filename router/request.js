const express = require('express');
const router = express.Router();
const Request = require('../controllers/request');
const roleMiddleware = require('../helper/roles')
const middleware = require('../helper/middleware');

router.post('/make-request', middleware.verifyToken, Request.createRequest);

router.get('/see-requests', middleware.verifyToken,roleMiddleware('isAdmin'), Request.getAllRequests);

module.exports = router;
