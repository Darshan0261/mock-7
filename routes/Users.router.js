const express = require('express');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const { UserModel } = require('../models/User.model');
const { BlacklistModel } = require('../models/Blacklist,model')
const { authentication } = require('../middlewares/authentication');

const userRouter = express.Router();


userRouter.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).send({ message: 'Email and Password Required' });
        }
        const userExists = await UserModel.findOne({ email });
        if (userExists) {
            return res.status(400).send({ message: 'Email already registerd' })
        }
        bcrypt.hash(password, +process.env.saltRounds, async function (err, hash) {
            if (err) {
                return res.status(501).send({ message: err.message })
            }
            const user = new UserModel({ email, password: hash });
            await user.save()
            const blacklist = new BlacklistModel({ user_id: user._id });
            await blacklist.save()
            res.status(201).send({ message: 'User Registered Sucessfully' })
        });
    } catch (error) {
        return res.status(501).send({ message: error.message })
    }
})

userRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send({ message: 'Email and Password Required' })
    }
    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).send({ message: 'User Not Registered' });
        }
        bcrypt.compare(password, user.password, function (err, result) {
            if (err) {
                return res.status(501).send({ message: err.message })
            }
            if (!result) {
                return res.status(401).send({ message: 'Wrong Credentials' })
            }
            const token = jwt.sign({ id: user._id, email: user.email }, process.env.privateKey);
            return res.send({ message: 'Login Sucessfull', token })
        });
    } catch (error) {
        return res.status(501).send({ message: error.message })
    }
})

userRouter.get('/getProfile', authentication, async (req, res) => {
    const { id } = req.body.token;
    try {
        const user = await UserModel.findById(id);
        if (!user) {
            return res.status(404).send({ message: 'Login to Continue' });
        }
        return res.send(user)
    } catch (error) {
        return res.status(501).send({ message: error.message })
    }
})

userRouter.patch('/edit', authentication, async (req, res) => {
    const payload = req.body;
    const { id } = req.body.token;
    let password = payload.password;
    if (password) {
        bcrypt.hash(password, +process.env.saltRounds, async function (err, hash) {
            if(err) {
                return res.status(501).send({message: err.message})
            }
            try {
                await UserModel.findOneAndUpdate({ _id: id }, {...payload, password: hash})
                res.send({ message: 'Profile Updated Sucessfully' })
            } catch (error) {
                return res.status(501).send({ message: error.message })
            }
        });
    } else {
        try {
            await UserModel.findOneAndUpdate({ _id: id }, payload)
            res.send({ message: 'Profile Updated Sucessfully' })
        } catch (error) {
            return res.status(501).send({ message: error.message })
        }
    }
    
})

userRouter.get('/logout', authentication, async (req, res) => {
    const token = req.headers.authorization;
    const { id } = req.body.token;
    try {
        const blacklist = await BlacklistModel.findOne({ user_id: id });
        blacklist.tokens.push(token);
        await blacklist.save();
        return res.send({ message: 'Logout Sucessfull' });
    } catch (error) {
        return res.status(501).send({ message: error.message })
    }
})

module.exports = {
    userRouter
}