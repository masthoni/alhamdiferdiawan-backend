const Wallets = require('../models/index').Wallets
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
                    walletName: { 
                        [Op.like]: `%${q}%` 
                    }
                },
            ]
        } : null;

        const { limit, offset } = getPagination(page, size);

        let wallet = await Wallets.findAndCountAll({
            order: [
                ['id', 'DESC']
            ],
            where: criteria,
            limit,
            offset,
        });

        res.status(200).json({
            status: false,
            message: 'Data Wallet berhasil di dapatkan',
            data: getPagingData(wallet, page, limit),
        });
    } catch (error) {
        next(error)
    }
}

async function store(req, res, next){

    try {
        let payload = req.body
        let wallet = await Wallets.create(payload)
        return res.status(201).json(wallet);
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
        let wallet  = await Wallets.findByPk(req.params.id);
        if(!wallet) return res.status(404).json({error: true, message: 'wallet not found'})
        else{
            let newWallet = await wallet.update(payload)
            res.json(newWallet);
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
        let wallet  = await Wallets.findByPk(req.params.id);
        if(!wallet) return res.status(404).json({error: true, message: 'wallet not found'})
        else{
            await wallet.destroy()
            res.json(wallet);
        }
    } catch (error) {
        next(error)
    }
}

module.exports = {index, store, update, destroy}