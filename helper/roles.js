const roleMiddleware = (role) => {
    return (req, res, next) => {
        console.log('Checking role:', role);
        console.log('User object:', req.user);
        if (req.user && (req.user.isAdmin || req.user[role] === true)) {
            console.log('Role verified');
            next();
        } else {
            console.log('Access denied');
            res.status(403).send('Access denied.');
        }
    };
};

module.exports = roleMiddleware;
