const Item = require('../models/index').Items
const Submission = require('../models/index').Submissions
const SubmissionCategory = require('../models/index').SubmissionCategories
const fs = require('fs')
const config = require('./../config/config')
const path = require('path')
const {getPagingData, getPagination} = require('../utils/paginate')
const { Op } = require("sequelize");
const  Sequelize = require("sequelize");
const bcrypt = require('bcryptjs')
const db = require('../models/index')


async function index(req, res, next){
    try {
        const { page, size, typeWaktu, startDate, endDate} = req.query;

        let ColumnType;
        let where = null;

        if(typeWaktu === 'tanggal') {
            columnType = '$submissions.date$';
            where = startDate && endDate ? { 
                    [columnType] : {
                        [Op.between]: [
                            startDate,
                            endDate
                        ]
                    },
                    'submissionId' : {
                        [Op.not]: 0
                    }
                } : {
                    'submissionId' : {
                        [Op.not]: 0
                    }
                };
        } else {
            columnType = '$submissions.dueDate$';
            where = startDate && endDate ? { 
                [columnType] : {
                    [Op.between]: [
                        startDate,
                        endDate
                    ]
                },
                'submissionId' : {
                    [Op.notIn]: [0]
                }
            } : {
                'submissionId' : {
                    [Op.not]: 0
                }
            };
        }

        const { limit, offset } = getPagination(page, size);

        let items = await Item.findAndCountAll({
            include: {
                model: Submission,
                as:'submissions',
                include: {
                    model: SubmissionCategory,
                    as:'submission_category',
                }
            },
            where: where,
            limit,
            offset,
        });

        res.status(200).json({
            status: false,
            message: 'Data Items berhasil di dapatkan',
            data: getPagingData(items, page, limit),
        });
    } catch (err) {
        next(err)
    }
}

async function getItems(req, res, next){
    try {
        const { page, size, q } = req.query;

        const { limit, offset } = getPagination(page, size);

        let criteria = q ? {
            [Op.or]: [
                {
                    itemName: { 
                        [Op.like]: `%${q}%` 
                    }
                },
            ]
        } : null;

        let items = await Item.findAndCountAll({
            attributes: ['itemName', [Sequelize.fn('MAX', Sequelize.col('sellingPrice')), 'sellingPrice'], [Sequelize.fn('MAX', Sequelize.col('buyingPrice')), 'buyingPrice'], [Sequelize.fn('MAX', Sequelize.col('productId')), 'productId']] ,
            // include: {
            //     model: Submission,
            //     attributes: ['submissionName'] ,
            //     as:'submissions',
            //     include: {
            //         model: SubmissionCategory,
            //         as:'submission_category',
            //         attributes: ['submissionType'] ,
            //         // where:{
            //         //     submissionType: 'PENGELUARAN'
            //         // }
            //     }
            // },
            // where: {
            //     '$submissions.submission_category.submissionType$' : q
            // },
            where: criteria,
            limit,
            offset,
            group: ['itemName']
        });

        res.status(200).json({
            status: false,
            message: 'Data Items berhasil di dapatkan',
            data: getPagingData(items, page, limit),
        });
    } catch (err) {
        next(err)
    }
}

module.exports = {
    getItems, index
}