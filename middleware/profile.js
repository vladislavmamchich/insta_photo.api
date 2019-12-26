const jwt = require('jsonwebtoken')
const { isValidAmount, isValidPaymentSystem } = require('../utils/helpers')

const addFundsMiddleware = async (req, res, next) => {
    try {
        const { amount, payment_system } = req.body
        if (!isValidAmount(amount)) {
            throw { msg: 'Invalid amount' }
        }
        if (!isValidPaymentSystem(payment_system)) {
            throw { msg: 'Invalid payment system' }
        }
        next()
    } catch (err) {
        res.status(422).json(err)
    }
}

const withdrawMiddleware = async (req, res, next) => {
    try {
        const { amount } = req.body
        if (!isValidAmount(amount)) {
            throw { msg: 'Invalid amount' }
        }
        // if (!isValidPaymentSystem(payment_system)) {
        //     throw { msg: 'Invalid payment system' }
        // }
        next()
    } catch (err) {
        res.status(422).json(err)
    }
}

module.exports = {
    addFundsMiddleware,
    withdrawMiddleware
}
