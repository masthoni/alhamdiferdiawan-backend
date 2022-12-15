const passport = require('passport')
const jwt  = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('./../models/index').User
const { Op } = require("sequelize");
const Sequelize = require('sequelize')
const {secretKey} = require('../config/config')
const {getToken} = require('../utils/get-token')

async function login(req, res, next){
    passport.authenticate('local', async function(err, user){
        if(err) return next(err);

        if(!user) return res.status(401).json({error: true, message: 'email or password incorrect'})

        let token = jwt.sign(user, secretKey);

        await User.update(
            {'token': Sequelize.fn('array_append', Sequelize.col('token'), token)},
            {'where': {'id': user.id}}
        );

        return res.json({
            message: 'logged in successfully',
            user,
            token
        })

    })(req,res,next);
}

async function localStartegy(email, password, done){
    try {
        let user = await User.findOne({
            attributes: {
                exclude: ['token', 'createdAt', 'updatedAt']
            },
            where: {
                [Op.or]: [
                    {
                      email: {
                        [Op.eq]: email
                      }
                    },
                    {
                        username: {
                          [Op.eq]: email
                        }
                    },
                ]
            }
        })

        if (!user) return done()

        if(bcrypt.compareSync(password, user.password)){
            ( {password, ...userWithoutPassword} = user.toJSON() );
            return done(null, userWithoutPassword);
        }

    } catch (error) {
        done(error, null)
    }

    done();
}

async function logout(req, res, next){
    let token = getToken(req);

    let user =  await User.update(
        {'token': Sequelize.fn('array_remove', Sequelize.col('token'), token)},
        {'where': {'id': req.user.id}}
    );

    if(!user || !token){
        return res.json({
            error: true,
            message: 'User tidak ditemukan'
        });
    }

    return res.json({
        error: false,
        message: 'Logout berhasil'
    });
}

async function me(req,res, next){
    let user = req.user
    return res.json(user)
}

module.exports = {login, localStartegy, login, logout, me}