const jwt = require('jsonwebtoken');
const config = require('config');
const { User } = require('../models/users/user');
const { Admin } = require('../models/users/admin');

module.exports = async function (req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({
        'message': "Access denied. No token provided"
    });

    try {
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));

        let user;
        if(decoded.role === 'A')
            user = await Admin.findById(decoded._id);
        else 
            user = await User.findById(decoded._id);

        let allowed = false;
        
        if (user.tokensAndDevices.length > 0){
            for (let i in user.tokensAndDevices){
                if(decoded.jti == user.tokensAndDevices[i].jti && req.header('hardwareId') == user.tokensAndDevices[i].hardwareId) allowed = true;
            }
        }

        if (allowed) {
            req.user = decoded;
            next();
        } else {
            return res.status(403).json({
                'message': "Forbidden. Access denied!"
            });
        }
    } catch (error) {
        return res.status(400).json({
            'message': "Invalid Token"
        });
    }
}