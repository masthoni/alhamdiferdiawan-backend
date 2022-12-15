const Product = require('../models/index').Products
const Items = require('../models/index').Items
const Submissoins = require('../models/index').Submissions
const SubmissoinsCategory = require('../models/index').SubmissionCategories
const ProductCategory = require('../models/index').ProductCategories
const fs = require('fs')
const config = require('./../config/config')
const path = require('path')
const {getPagingData, getPagination} = require('../utils/paginate')
const Sequelize = require("sequelize");

async function index(req, res, next){
    try {
        const { page, size, q } = req.query;

        const { limit, offset } = getPagination(page, size);

        let where = q ? {
            '$submission_category.submissionType$' : q
        } : null;

        let product = await Product.findAndCountAll({
            attributes: [
                'id',
                'productCategoryId',
                'productName',
                'stock',
                'sellingPrice',
                'buyingPrice',
                'description',
                'status',
                'photoProduct',
            ],
            
            distinct: true,
            include: ['product_category', {
                model: Items,
                group: ['productId'],
                as: 'item'
            }],
            // order: [
            //     ['id', 'DESC']
            // ],
            limit,
            offset,
        });

        res.status(200).json({
            status: false,
            message: 'Data Product berhasil di dapatkan',
            data: getPagingData(product, page, limit),
        });
    } catch (err) {
        next(err)
    }
}

async function store(req, res, next){
    try {
        let payload = req.body
        let findCategory = await ProductCategory.findByPk(payload.productCategoryId);
        if(!findCategory){
            return res.status(404).json({error: true, message: 'product category not found'})
        }else{
            let items = await Items.findAll({
                include: {
                    model: Submissoins,
                    as:'submissions',
                    include: {
                        model: SubmissoinsCategory,
                        as:'submission_category',
                    }
                },
                where: Sequelize.where(
                    Sequelize.fn('lower', Sequelize.col('itemName')), 
                    Sequelize.fn('lower', payload.productName)
                ),
            });
    
            if(items.length > 0 && items){
                if(items.length > 0 && items){
                    items.forEach(item => {
                        if(item.submissions && item.submissions.submission_category.submissionType === 'PEMASUKAN' && ['APPROVED', 'PARTIAL PAID', 'PAID', 'COMPLETE'].includes(item.submissions.status)){
                            payload.stock -= parseFloat(item.qty) 
                        }else if(item.submissions && item.submissions.submission_category.submissionType === 'PENGELUARAN' && item.submissions.status === 'COMPLETE'){
                            payload.stock = parseFloat(payload.stock) + parseFloat(item.qty) 
                        }
                    });
                }
            }

            if(req.file){
                let tmp_path = req.file.path;
                let originalExt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];
                let filename = req.file.filename + '.' + originalExt;
                let target_path = path.resolve(config.rootPath, `public/foto_product/${filename}`);
                const src = fs.createReadStream(tmp_path);
                const dest = fs.createWriteStream(target_path);
                src.pipe(dest)
                src.on('end', async () => {
                    try{
                        let product = await Product.create({...payload, photoProduct: filename, status: 'PENDING'}, {include: 'items'});
                        await Items.create({
                            itemName: payload.productName,
                            qty: 0,
                            submissionId: 0,
                            productId: product.id,
                            sellingPrice: payload.sellingPrice,
                            buyingPrice: payload.buyingPrice,
                            discount: 0,
                            tax: 0,
                            userId: req.user.id
                        })
                        return res.status(201).json(product);
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
                const {photoProduct, ...newPayload} = payload
                let product = await Product.create(newPayload, {include: 'items'})
                await Items.create({
                    itemName: payload.productName,
                    qty: 0,
                    submissionId: 0,
                    productId: product.id,
                    sellingPrice: payload.sellingPrice,
                    buyingPrice: payload.buyingPrice,
                    discount: 0,
                    tax: 0,
                    userId: req.user.id
                })
                return res.status(201).json(product);
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

async function destroy(req, res, next) {
    try {
        let product  = await Product.findByPk(req.params.id);
        if(!product) return res.status(404).json({error: true, message: 'prdouct not found'})
        else{
            await product.destroy()
            res.json(product);
        }
    } catch (error) {
        next(error)
    }
}

module.exports = {
    index, store, destroy
}