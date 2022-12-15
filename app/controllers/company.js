const Company = require('../models/index').Company
const fs = require('fs')
const config = require('./../config/config')
const path = require('path')
const db = require('../models/index')

async function index(req, res, next){
    // let data = await db.sequelize.query('SELECT * FROM "Companies" LIMIT 1', {
    //     type: db.sequelize.QueryTypes.SELECT
    // });

    let data = await Company.findOne();

    if(data){
        res.status(200).json({
            error: false,
            message: 'Data Company Ada',
            data: data,
        })
    }else{
        res.status(200).json({
            error: true,
            message: 'Data Company Tidak Ada',
            data: null,
        })
    }

    // res.send(data)
}

async function store(req, res, next){
    try {
        let payload = req.body
        if(req.file){
            let tmp_path = req.file.path;
            let originalExt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];
            let filename = req.file.filename + '.' + originalExt;
            let target_path = path.resolve(config.rootPath, `public/foto_company/${filename}`);
            const src = fs.createReadStream(tmp_path);
            const dest = fs.createWriteStream(target_path);
            src.pipe(dest)
            src.on('end', async () => {
                try{
                    let company = await Company.create({...payload, companyLogo: filename});
                    return res.status(201).json(company);
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
            const {companyLogo, ...newPayload} = payload
            let company = await Company.create(newPayload)
            return res.status(201).json(company);
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
        let company  = await Company.findByPk(req.params.id);

        if(!company) return res.status(404).json({error: true, message: 'company not found'})
        else{
            if(req.file){
                let tmp_path = req.file.path;
                let originalExt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];
                let filename = req.file.filename + '.' + originalExt;
                let target_path = path.resolve(config.rootPath, `public/foto_company/${filename}`);
                const src = fs.createReadStream(tmp_path);
                const dest = fs.createWriteStream(target_path);
                src.pipe(dest)
                src.on('end', async () => {
                    try{
                        let currentImage = `${config.rootPath}/public/foto_company/${company.imageUser}`;
                        if(fs.existsSync(currentImage)){
                            fs.unlinkSync(currentImage);
                        }
                        let newCompany = await company.update({...payload, companyLogo: filename});
                        res.json(newCompany);
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
                const {companyLogo, ...newPayload} = payload
                let newCompany = await company.update(newPayload)
                res.json(newCompany);
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

module.exports = {
    store, index, update
}
