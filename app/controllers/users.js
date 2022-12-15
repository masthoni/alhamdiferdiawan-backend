const User = require('../models/index').User
const fs = require('fs')
const config = require('./../config/config')
const path = require('path')
const {getPagingData, getPagination} = require('../utils/paginate')
const { Op } = require("sequelize");
const bcrypt = require('bcryptjs')


async function index(req, res, next){
    try {
        const { page, size, q } = req.query;

        let criteria = q ? {
            [Op.or]: [
                {
                    fullName: { 
                        [Op.like]: `%${q}%` 
                    }
                },
                {
                    username: {
                        [Op.like]: `%${q}%`
                    }
                },
                {
                    email: {
                        [Op.like]: `%${q}%`
                    }
                },
            ]
        } : null;

        const { limit, offset } = getPagination(page, size);

        let users = await User.findAndCountAll({
            order: [
                ['id', 'DESC']
            ],
            where: criteria,
            limit,
            offset,
            attributes: {
                exclude: ['token', 'password']
            },
        });

        res.status(200).json({
            status: false,
            message: 'Data user berhasil di dapatkan',
            data: getPagingData(users, page, limit),
        });
    } catch (error) {
        next(error)
    }
}

async function store(req, res, next){

    try {
        let payload = req.body
        if(req.file){
            let tmp_path = req.file.path;
            let originalExt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];
            let filename = req.file.filename + '.' + originalExt;
            let target_path = path.resolve(config.rootPath, `public/foto_user/${filename}`);
            const src = fs.createReadStream(tmp_path);
            const dest = fs.createWriteStream(target_path);
            src.pipe(dest)
            src.on('end', async () => {
                try{
                    let user = await User.create({...payload, imageUser: filename});
                    return res.status(201).json(user);
                }catch(error){
                    fs.unlinkSync(target_path);
                    
                    if(error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError'){
                        return res.status(422).json({
                            error: true,
                            message: error.message,
                            data: error.errors,
                        })
                    }

                    next(error)
                }
            })

            src.on('error', async() => {
                next(err)
            })
        }else{
            const {imageUser, ...newPayload} = payload
            let user = await User.create(newPayload)
            const {token, password, ...newUserWithoutToken} = user.toJSON();
            return res.status(201).json(newUserWithoutToken);
        }

    } catch (error) {

        if(error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError'){
            return res.status(422).json({
                error: true,
                message: error.message,
                data: error.errors,
            })
        }

        next(error)
    }
}

async function update(req, res, next){
    try {
        let payload = req.body
        let user  = await User.findByPk(req.params.id);
        payload.password = payload.password ? bcrypt.hashSync(payload.password, 10) : user.password

        if(!user) return res.status(404).json({error: true, message: 'user not found'})
        else{
            if(req.file){
                let tmp_path = req.file.path;
                let originalExt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];
                let filename = req.file.filename + '.' + originalExt;
                let target_path = path.resolve(config.rootPath, `public/foto_user/${filename}`);
                const src = fs.createReadStream(tmp_path);
                const dest = fs.createWriteStream(target_path);
                src.pipe(dest)
                src.on('end', async () => {
                    try{
                        let currentImage = `${config.rootPath}/public/foto_user/${user.imageUser}`;
                        if(fs.existsSync(currentImage)){
                            fs.unlinkSync(currentImage);
                        }
                        let newUser = await user.update({...payload, imageUser: filename})
                        const {token, password, ...newUserWithoutToken} = newUser.toJSON();
                        res.json(newUserWithoutToken);
                    }catch(error){
                        fs.unlinkSync(target_path);
                        if(error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError'){
                            return res.status(422).json({
                                error: true,
                                message: error.message,
                                data: error.errors,
                            })
                        }
    
                        next(error)
                    }
                })
                src.on('error', async() => {
                    next(err)
                })
            }else{
                const {imageUser, ...newPayload} = payload
                let newUser = await user.update(newPayload)
                const {token, password, ...newUserWithoutToken} = newUser.toJSON();
                res.json(newUserWithoutToken);
            }
        }
    } catch (error) {
        if(error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError'){
            return res.status(422).json({
                error: true,
                message: error.message,
                data: error.errors,
            })
        }

        next(error)
    }
}

async function destroy(req, res, next){
    try {
        
        let user = await User.findByPk(req.params.id);
    
        if(!user) return res.status(404).json({error: true, message: 'user not found'})
        else{
            let currentImage = `${config.rootPath}/public/foto_user/${user.imageUser}`;
        
            if(fs.existsSync(currentImage)){
                fs.unlinkSync(currentImage);
            }
    
            await user.destroy()
        
            res.json(user);
        }

    } catch (error) {
        next(error)
    }
}


module.exports = {index, store, destroy, update}