const jwt = require('jsonwebtoken');
const secretKey = 'secret_key'; //store somewhere else and change later.

function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];

    if(!token) {
        return res.status(401).json({error: "Access token is missing or invalid."});
    }

    jwt.verify(token, secretKey, (err, user) => {
        if(err){
            return res.status(403).json({error: "Token is invalid or expired."});
        }
        req.user = user;
        next();
    })
}

function authenticateAdmin(req, res, next) {
    authenticateToken(req, res, ()=>{
        if(req.user.role !== 'Admin' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin privileges required.'});
        }
        next();
    });
}

module.exports = { authenticateToken, authenticateAdmin };