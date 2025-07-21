const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        //console.log("Authenticated User:", user); // Log user details
        next();
    });
};

exports.authenticateUser = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; //attach user data (id,role) to request 
        req.user.userId
        //console.log("Authenticated User:", decoded); // Log user details
        next();
    } catch (err) {
        res.status(403).json({ message: "Invalid token" });
    }
};

// Role-based authorization
exports.authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied" });
        }
        //console.log(`User Role: ${req.user.role} - Access Granted`); // Log role verification
        next();
    };
};


