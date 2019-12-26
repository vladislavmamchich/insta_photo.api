const jwt = require('jsonwebtoken')
const User = require('../db/models/User')
const Transaction = require('../db/models/Transaction')
const { pm_generateForm } = require('../utils/perfect_money')
const { payeer_generateForm } = require('../utils/payeer')
require('dotenv').config()
const { JWT_SECRET } = process.env
const { PERFECT_MONEY, PAYEER } = require('../config/payment_systems')

const getProfile = async (req, res) => {
    try {
        const { token } = req
        const { _id } = await jwt.verify(token, JWT_SECRET)
        let user = await User.findOne({ _id }, { password: 0 })
        if (!user) {
            res.status(422).json({ msg: 'User not found' })
        } else {
            res.status(200).json({
                user
            })
        }
    } catch (err) {
        res.status(422).json(err)
    }
}

const addFunds = async (req, res) => {
    try {
        const {
            token,
            body: { amount, payment_system }
        } = req
        const { _id } = await jwt.verify(token, JWT_SECRET)
        if (payment_system === PERFECT_MONEY) {
            const pm_form = pm_generateForm({
                PAYMENT_ID: _id,
                PAYMENT_AMOUNT: amount
            })
            res.status(200).json({ form: pm_form })
            // document.write(res.form)
            // document.getElementById('FORM_pay_ok').submit()
        } else if (payment_system === PAYEER) {
            const payeer_form = payeer_generateForm({
                m_orderid: _id,
                m_amount: amount
            })
            res.status(200).json({ form: payeer_form })
        } else {
            res.status(422).json({ msg: 'Не поддерживается' })
        }
    } catch (err) {
        res.status(422).json(err)
    }
}

const withdraw = async (req, res) => {
    try {
        const {
            token,
            body: { amount, card_number }
        } = req
        const { _id } = await jwt.verify(token, JWT_SECRET)
        const user = await User.findOne({ _id })
        if (+user.avaliable_balance < +amount) {
            res.status(422).json({ msg: 'Недостаточно средств' })
        } else {
            user.avaliable_balance = +user.avaliable_balance - +amount
            await user.save()
            await Transaction.create({
                amount,
                user: _id,
                type: 'withdraw',
                card_number
            })
            res.status(200).json({ msg: 'Ваш запрос принят' })
        }
    } catch (err) {
        res.status(422).json(err)
    }
}

module.exports = {
    getProfile,
    addFunds,
    withdraw
}
