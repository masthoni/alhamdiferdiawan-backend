const {getToken} = require('../utils/get-token')
const jwt = require('jsonwebtoken');
const {secretKey} = require('../config/config')
const User = require('./../models/index').User
const { Op } = require("sequelize");

function decodeToken(){
   return async function(req, res, next){
      try {
         let token = getToken(req);

         if(!token){
               return res.status(401).json({
                  status: false,
                  message: `Your're not login or token expired`
               })
         }else{
               req.user = jwt.verify(token, secretKey)
   
               let user = await User.findOne({
                  attributes: {
                     exclude: ['password', 'createdAt', 'updatedAt']
                  },
                  where: {
                     token: {
                           [Op.contains]: [token]
                     }
                  }
               })
   
               if(!user){
                  return res.status(401).json({
                     error: true,
                     message: `Token expired`
                  });
               }
         }


      } catch (err) {
         if(err && err.name === 'JsonWebTokenError'){
               return res.status(401).json({
                  error: 1,
                  message: err.message
               });
         }

         next(err);
      }

      return next()
    }
}

module.exports= {decodeToken}