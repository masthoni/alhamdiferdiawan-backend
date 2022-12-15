const SubmissionCategory = require('../models/index').SubmissionCategories
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
                    submissionCategory: { 
                        [Op.like]: `%${q}%` 
                    }
                },
            ]
        } : null;

        const { limit, offset } = getPagination(page, size);

        let submissionCategories = await SubmissionCategory.findAndCountAll({
            order: [
                ['id', 'DESC']
            ],
            where: criteria,
            limit,
            offset,
        });

        res.status(200).json({
            status: false,
            message: 'Data Submission Category berhasil di dapatkan',
            data: getPagingData(submissionCategories, page, limit),
        });
    } catch (error) {
        next(error)
    }
}

async function store(req, res, next){

    try {
        let payload = req.body
        let category = await SubmissionCategory.create(payload)
        return res.status(201).json(category);
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
        let category  = await SubmissionCategory.findByPk(req.params.id);
        if(!category) return res.status(404).json({error: true, message: 'submission category not found'})
        else{
            let newCategory = await category.update(payload)
            res.json(newCategory);
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
        let category  = await SubmissionCategory.findByPk(req.params.id);
        if(!category) return res.status(404).json({error: true, message: 'submission category not found'})
        else{
            await category.destroy()
            res.json(category);
        }
    } catch (error) {
        next(error)
    }
}

async function getCategorySubmission(req, res, next){
    try {
        const { q } = req.query;

        const query = q ? {
            submissionType: q
        } : null

        let submissionCategories = await SubmissionCategory.findAll({
            order: [
                ['id', 'DESC']
            ],
            where: query
        });

        res.status(200).json({
            status: false,
            message: 'Data Submission Category berhasil di dapatkan',
            data: submissionCategories
        });
    } catch (error) {
        next(error)
    }
}

module.exports = {index, store, update, destroy, getCategorySubmission}