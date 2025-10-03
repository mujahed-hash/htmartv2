const roleMiddleware = (role) => {
    return (req, res, next) => {
        console.log('Checking role:', role);
        if (req.user) {
            let hasPermission = false;
            if (role === 'isAdmin') {
                hasPermission = req.user.isAdmin === true || req.user.isSuperAdmin === true;
            } else if (role === 'isSuperAdmin') {
                hasPermission = req.user.isSuperAdmin === true;
            } else {
                hasPermission = req.user[role] === true;
            }

            if (hasPermission) {
                console.log('Role verified');
                next();
            } else {
                console.log('Access denied: User does not have required role.', role);
                res.status(403).send('Access denied.');
            }
        } else {
            console.log('Access denied: User not authenticated.');
            res.status(401).send('Access denied. User not authenticated.');
        }
    };
};

module.exports = roleMiddleware;
