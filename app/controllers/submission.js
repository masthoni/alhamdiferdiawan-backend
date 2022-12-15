const Submission = require('../models/index').Submissions
const SubmissionCategory = require('../models/index').SubmissionCategories
const Items = require('../models/index').Items
const Transactions = require('../models/index').Transactions
const Wallets = require('../models/index').Wallets
const User = require('../models/index').User
const AttachmentSubmissions = require('../models/index').AttachmentSubmissions
const Products = require('../models/index').Products
const Sequelize  = require('sequelize')
const Op = Sequelize.Op;
const Company = require('../models/index').Company

const {getPagingData, getPagination} = require('../utils/paginate')

const calculateTotal = (req, submissionType) => {
    let amount = 0;
    req.body.items.forEach(element => {
        element.userId = req.user.id
        let total_harga = submissionType === "PEMASUKAN" ? element.qty * element.sellingPrice : element.qty * element.buyingPrice;
        let total_harga_discount = total_harga - ((total_harga * element.discount)/100)
        amount += total_harga_discount + ((total_harga_discount * element.tax)/100)
    });
    return amount;
}

const groupBy = (a, keyFunction) => {
    const groups = {};
    a.forEach(function(el) {
      const key = keyFunction(el);
      if (key in groups === false) {
        groups[key] = [];
      }
      groups[key].push(el);
    });
    return groups;
  }

const calculateStock = async (id, payload, res) => {
    let submission = await Submission.findByPk(id, {
        include: [
            {
                model: SubmissionCategory,
                as:'submission_category',
            },
            {
                model: Items,
                as:'items',
                attributes: [
                    'sellingPrice',
                    'discount',
                    'itemName',
                    'productId',
                    'qty',
                    'sellingPrice',
                    'tax'
                ]
            },
            {
                model: Transactions,
                as: 'transactions',
                include: {
                    model: Wallets,
                    as:'wallet',
                }
            },
            {
                model: AttachmentSubmissions,
                as: 'submission_attachments',
                include: {
                    model: User,
                    as:'user',
                }
            }
        ]
    });

    if(['APPROVED', 'PARTIAL PAID', 'PAID', 'COMPLETED'].includes(submission.status)){
        if(payload.fullfilment === true){
            if(submission.items && submission.items.length > 0){
                submission.items.forEach(async (element) => {
                    let product = await Products.findByPk(element.productId);
                    if(product){
                        if(submission.submission_category.submissionType === "PEMASUKAN"){
                            product.stock -= parseFloat(element.qty)
                        }
    
                        if(submission.submission_category.submissionType === "PENGELUARAN"){
                            product.stock += parseFloat(element.qty)
                        }
                        await product.update({stock: product.stock});
                    }
                
                })
            }
        }
        await submission.update(payload);

        res.json(submission);
    }else{
        return res.status(404).json({error: true, message: 'submissions can only be updated fullfilment in status APPROVED OR PARTIAL PAID OR PAID OR COMPELETED'});
    }
}

async function index(req, res, next){
    try {
        const { page, size, q } = req.query;

        const { limit, offset } = getPagination(page, size);

        let where = q ? {
            '$submission_category.submissionType$' : q
        } : null;

        let submissions = await Submission.findAndCountAll({
            distinct: true,
            include: 'submission_category',
            order: [
                ['id', 'DESC']
            ],
            where: where,
            limit,
            offset,
        });

        res.status(200).json({
            status: false,
            message: 'Data Submission berhasil di dapatkan',
            data: getPagingData(submissions, page, limit),
        });
    } catch (err) {
        next(err)
    }
}

async function create(req, res, next){
    try {
        let payload = req.body
        
        let findCategory = await SubmissionCategory.findByPk(payload.categoryId);

        if(!findCategory) return res.status(404).json({error: true, message: 'submission category not found'})
        else{
            let amount = calculateTotal(req, findCategory.submissionType);
            let newPayload = {...payload, userId: req.user.id, amount: amount}
            let submission = await Submission.create(newPayload, {include: 'items'})
            return res.status(201).json(submission);
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

async function show(req, res, next){
    try {

        let submission = await Submission.findOne({
            where: {
                id: req.params.id
            },
            include: [
                {
                    model: SubmissionCategory,
                    as:'submission_category',
                },
                {
                    model: Items,
                    as:'items',
                    attributes: [
                        'sellingPrice',
                        'discount',
                        'itemName',
                        'productId',
                        'qty',
                        'buyingPrice',
                        'tax'
                    ]
                },
                {
                    model: Transactions,
                    as: 'transactions',
                    include: {
                        model: Wallets,
                        as:'wallet',
                    }
                },
                {
                    model: AttachmentSubmissions,
                    as: 'submission_attachments',
                    include: {
                        model: User,
                        as:'user',
                    }
                }
            ]
        });

        if(!submission) return res.status(404).json({error: true, message: 'submission not found'})
        else{
            res.status(200).json({
                status: false,
                message: 'Data Submission berhasil di dapatkan',
                data: submission,
            });
        }
        
    } catch (err) {
        next(err)
    }
}

async function updateStatus(req, res, next){
    try {
        let payload = req.body;
        let findSubmission = await Submission.findByPk(req.params.id, {include: 'submission_category'});
        if(!findSubmission) return res.status(404).json({error: true, message: 'submission not found'});
        else{
            let newSubmission = await findSubmission.update(payload);
            return res.json(newSubmission)
        }
    } catch (error) {
        next(error);
    }
}

async function update(req, res, next){
    try {
        let payload = req.body
        let submission = await Submission.findByPk(req.params.id, {include: 'items'});
        let findCategory = await SubmissionCategory.findByPk(payload.categoryId);
        let amount = calculateTotal(req, findCategory.submissionType);
        if(!findCategory) return res.status(404).json({error: true, message: 'submission category not found'})
        else{
            if(['PARTIAL APPROVED', 'APPROVED', 'PARTIAL PAID', 'PAID', 'PENDING'].includes(submission.status)){
                if(amount !== parseFloat(submission.amount) && ['PARTIAL APPROVED', 'APPROVED', 'PARTIAL PAID', 'PAID'].includes(submission.status)){
                    return res.status(404).json({error: true, message: 'the previous total must equal the current total'})
                }else{
                    let newPayload = {...payload, userId: req.user.id, amount: amount}
                    await submission.update(newPayload)
                    await Items.destroy({
                        where: {
                            submissionId: submission.id
                        }
                    })
                    await Items.bulkCreate(payload.items)
                    return res.status(201).json(submission);
                }
            }else{
                return res.status(404).json({error: true, message: 'submissions can only be updated in status PARTIAL APPROVED OR APPROVED OR PARTIAL PAID OR PAID'});
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

async function updateFullfilment(req, res, next){
    try {
        let payload = req.body
        calculateStock(req.params.id, payload, res);
    } catch (error) {
        next(error)
    }
}

async function destroy(req,res,next){
    try {
        let submission = await Submission.findByPk(req.params.id);
        submission.destroy();
        return res.json(submission);
    } catch (error) {
        next(error)
    }
}

async function laporan(req, res, next){
    try {

        let { page, size, typeSubmission, startDate, endDate, typeFilter, month, years } = req.body;

        let year = new Date().getFullYear();

        if(typeFilter === 'Bulanan') {
            startDate = `${year}-${month}-01T00:00`
            endDate = `${year}-${month}-${month === '02' ? 27 : 30}T23:59`
        }

        if(typeFilter === 'Tahunan') {
            startDate = `${years}-01-01T00:00`
            endDate = `${years}-12-31T23:59`
        }

        let columnType;

        const { limit, offset } = getPagination(page, size);

        if(typeSubmission === 'PEMASUKAN'){
            columnType = 'sellingPrice';
        }else{
            columnType = 'buyingPrice';
        }

        let datas = await Items.findAndCountAll({
            include: {
                model: Submission,
                as:'submissions',
                include: {
                    model: SubmissionCategory,
                    as:'submission_category',
                    attributes: ['submissionType'] ,
                },
            },
            where: {
                '$submissions.dueDate$': {
                    [Op.between]: [
                        startDate,
                        endDate
                    ]
                },
                '$submissions.fullfilment$': true,
                '$submissions.submission_category.submissionType$' : typeSubmission,
            },
            limit,
            offset,
        });

        let company = null
        if(datas.rows.length){
            company = await Company.findOne()
            const byName = groupBy(datas.rows.filter(it => (parseFloat(it.qty) > 0)), it => it['itemName'])
            const output = Object.keys(byName).map((name, index) => {
                const total = byName[name].reduce((acc, it) => parseFloat(acc) + (parseFloat(it.qty) * parseFloat(it[`${columnType}`])), 0)
                const sum = byName[name].reduce((acc, it) => parseFloat(acc) + parseFloat(it.qty), 0)
                return {
                    'itemName': name,
                    qty: sum,
                    price: byName[name][0][`${columnType}`],
                    total: total
                }
            })
            datas.rows = output
        }

        let total  = datas.rows.reduce(function (acc, obj) { return acc + obj.total; }, 0);

        return res.json({ 'data' : 
            {
                'total': total,
                'laporan': getPagingData(datas, page, limit),
                'company': company
            }
        });
    } catch (error) {
        next(error)
    }
}

async function updateCompleted(req, res, next) {
    try {
        let submission = await Submission.findByPk(req.params.id, {include: 'items'});
        if(!submission) {
          return res.status(404).json({'status': false, 'message' : 'submission tidak ditemukan'})  
        }
        await submission.update({
            'status': 'COMPLETE'
        });
        return res.status(200).json(submission);
    } catch (error) {
        next(error)
    }
}

module.exports = {
    index, create, show, updateStatus, update, destroy, updateFullfilment, laporan, updateCompleted
}