const jwt = require('jsonwebtoken');
const { BlacklistModel } = require('../models/Blacklist,model');
require('dotenv').config()

const authentication = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).send({ message: 'Login to Continue' })
    }
    try {
        jwt.verify(token, process.env.privateKey, async function (err, decoded) {
            if (err) {
                return res.status(501).send({ message: err.message })
            }
            req.body.token = decoded;
            const user_id = decoded.id;
            const blacklist = await BlacklistModel.findOne({ user_id });
            if (blacklist.tokens.some(ele => {
                return ele == token;
            })) {
                return res.status(401).send('Login to Continue')
            }
            next()
        });
    } catch (error) {
        return res.status(501).send({ message: error.message })
    }
}

module.exports = {
    authentication
}