const jwt = require('jsonwebtoken');
// const authorize = jwt({
//     secret: process.env.secret,
//     userProperty: 'payload',
//     algorithms: ["HS256"],
// });

// module.exports = {
//     authorize
// }

module.exports.verifyToken = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        console.error('No token provided');
        return res.status(401).send('Access denied. No token provided.');
    }

    try {
        // console.log('Token received:', token);
        const decoded = jwt.verify(token, process.env.SECRET);
        // console.log('Token decoded:', decoded);
        req.user = decoded;
        req.userId = decoded.userId;
        next();
    } catch (ex) {
        console.error('Token verification failed:', ex.message);
        res.status(400).send('Invalid token.');
    }
};
