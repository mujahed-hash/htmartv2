const roleMiddleware = (role) => {
    return (req, res, next) => {
        console.log('Checking role:', role);
        if (req.user) {
            let hasPermission = false;

            // Handle array of roles (for multiple role access)
            if (Array.isArray(role)) {
                hasPermission = role.some(r => {
                    if (r === 'isAdmin') {
                        return req.user.isAdmin === true || req.user.isSuperAdmin === true;
                    } else if (r === 'isSuperAdmin') {
                        return req.user.isSuperAdmin === true;
                    } else {
                        // For supplier routes, allow admins and superadmins to access
                        return req.user[r] === true || req.user.isAdmin === true || req.user.isSuperAdmin === true;
                    }
                });
            } else {
                // Handle single role
                if (role === 'isAdmin') {
                    hasPermission = req.user.isAdmin === true || req.user.isSuperAdmin === true;
                } else if (role === 'isSuperAdmin') {
                    hasPermission = req.user.isSuperAdmin === true;
                } else {
                    // For supplier routes, allow admins and superadmins to access
                    hasPermission = req.user[role] === true || req.user.isAdmin === true || req.user.isSuperAdmin === true;
                }
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
