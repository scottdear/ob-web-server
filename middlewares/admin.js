module.exports = function (req, res, next) {
    if (!req.user) return res.status(401).json({
        'message': "Access denied. No token provided"
    });

    if (req.user.role !== "A")
        return res.status(401).json({
            'message': "Access denied. you are not allowed to access this resource"
        });

    next();
}