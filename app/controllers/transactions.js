const Transaction = require('../models/index').Transactions
const Submission = require('../models/index').Submissions
const SubmissionCategory = require('../models/index').SubmissionCategories
const Wallet = require('../models/index').Wallets
const fs = require('fs')
const config = require('./../config/config')
const path = require('path')
const {getPagingData, getPagination} = require('../utils/paginate')
const { Op } = require("sequelize");
const Sequelize = require("sequelize");


const setStatus = (amountSubmission, amountTransaction) => {
    if(amountTransaction === parseFloat(amountSubmission)){
        return "PAID";
    }else{
        return "PARTIAL PAID";
    }
};

async function index(req, res, next){
    try {
        const { page, size, typeSubmission, startDate, endDate } = req.query;
        let where = null;
        if(startDate && endDate) {
            where = {
                '$submission.submission_category.submissionType$' : typeSubmission,
                '$submission.dueDate$': {
                    [Op.between]: [
                        startDate,
                        endDate
                    ]
                },
            }
        }

        const { limit, offset } = getPagination(page, size);

        let transactions = await Transaction.findAndCountAll({
            include: [
                {
                    model: Submission,
                    as:'submission',
                    include: {
                        model: SubmissionCategory,
                        as:'submission_category',
                    }
                },
                {
                    model: Wallet,
                    as:'wallet',
                }
            ],
            where: where,
            order: [
                ['id', 'DESC']
            ],
            limit,
            offset,
        });

        res.status(200).json({
            status: false,
            message: 'Data Transactions berhasil di dapatkan',
            data: getPagingData(transactions, page, limit),
        });
    } catch (error) {
        next(error)
    }
}

async function store(req, res, next){

    try {
        let payload = req.body
        let submission = await Submission.findByPk(payload.submissionId);
        const totalAmountTransaction = await Transaction.findOne({
            where: {
                submissionId  : payload.submissionId
            },
            attributes: [
                'submissionId',
                [Sequelize.fn('sum', Sequelize.col('amount')), 'amount'],
            ],
            group: ['submissionId']
        });
        if(!submission) return res.status(404).json({error: true, message: 'submission not found'})
        else{
            
            if(submission.status != 'APPROVED' && submission.status != 'PARTIAL PAID') return res.status(404).json({error: true, message: 'submission status must be APPROVED or PARTIAL PAID'});
            else{
                if((parseFloat(payload.amount) + parseFloat(totalAmountTransaction ? totalAmountTransaction.amount : 0)) > parseFloat(submission.amount)) return res.status(404).json({error: true, message: 'the money paid is greater than what is paid'});
                else{
                    if(req.file){
                        let tmp_path = req.file.path;
                        let originalExt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];
                        let filename = req.file.filename + '.' + originalExt;
                        let target_path = path.resolve(config.rootPath, `public/attachment_transactions/${filename}`);
                        const src = fs.createReadStream(tmp_path);
                        const dest = fs.createWriteStream(target_path);
                        src.pipe(dest)
                        src.on('end', async () => {
                            try{
                                let transaction = await Transaction.create({...payload, attachmentTransaction: filename});
                                let status = setStatus(submission.amount, (parseFloat(payload.amount) + parseFloat(totalAmountTransaction ? totalAmountTransaction.amount : 0)));
                                await submission.update({status});
                                return res.status(201).json(transaction);
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
                        const {attachmentTransaction, ...newPayload} = payload
                        let transaction = await Transaction.create(newPayload)
                        let status = setStatus(submission.amount, (parseFloat(payload.amount) + parseFloat(totalAmountTransaction ? totalAmountTransaction.amount : 0)));
                        await submission.update({status});
                        return res.status(201).json(transaction);
                    }
                }
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
    index, store
}