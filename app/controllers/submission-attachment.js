const AttachmentSubmissions = require('../models/index').AttachmentSubmissions
const fs = require('fs')
const config = require('./../config/config')
const path = require('path')

async function store(req, res, next){
    try {
        let payload = req.body
        if(req.file){
            let tmp_path = req.file.path;
            let originalExt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];
            let filename = req.file.filename + '.' + originalExt;
            let target_path = path.resolve(config.rootPath, `public/attachment_submissions/${filename}`);
            const src = fs.createReadStream(tmp_path);
            const dest = fs.createWriteStream(target_path);
            src.pipe(dest)
            src.on('end', async () => {
                try{
                    let attachmentSubmissions = await AttachmentSubmissions.create({...payload, attachmentSubmissoin: filename, userId: req.user.id});
                    return res.status(201).json(attachmentSubmissions);
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
            const {attachmentSubmissoin, ...newPayload} = payload
            let attachmentSubmissions = await AttachmentSubmissions.create(newPayload)
            return res.status(201).json(attachmentSubmissions);
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
    store
}