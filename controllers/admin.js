const jwt = require('jsonwebtoken')
const Transaction = require('../db/models/Transaction')

require('dotenv').config()
const { JWT_SECRET } = process.env

const deleteWithdrawRequest = async (req, res) => {
	try {
		const {
			params: { id }
		} = req
		await Transaction.deleteOne({
			_id: +id
		})
		const txs = await Transaction.find()
		let addFundsTxs = [],
			withdrawTxs = []
		txs.forEach(tx => {
			if (tx.type === 'withdraw') {
				withdrawTxs.push(tx)
			} else {
				addFundsTxs.push(tx)
			}
		})
		res.render('index', {
			addFundsTxs,
			withdrawTxs
		})
	} catch (error) {
		res.render('error', { error })
	}
}

const admin = async (req, res) => {
	try {
		const { token } = req
		const txs = await Transaction.find()
		let addFundsTxs = [],
			withdrawTxs = []
		txs.forEach(tx => {
			if (tx.type === 'withdraw') {
				withdrawTxs.push(tx)
			} else {
				addFundsTxs.push(tx)
			}
		})
		res.render('index', {
			addFundsTxs,
			withdrawTxs
		})
	} catch (error) {
		res.render('error', { error })
	}
}

module.exports = {
	admin,
	deleteWithdrawRequest
}
