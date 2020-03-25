const { REDIS_PORT } = process.env
const redis = require('redis')
const { promisify } = require('util')

const connect = () => {
	try {
		const redisClient = redis.createClient(REDIS_PORT)
		const getAsyncFromRedis = promisify(redisClient.get).bind(redisClient)
		return { redisClient, getAsyncFromRedis }
	} catch (err) {
		console.log(123, err)
	}
}
const { redisClient, getAsyncFromRedis } = connect()

redisClient.on('error', () => {
	console.log(new Date() + ' Redis: disconnect')
	setTimeout(connect, 10 * 1000)
})

module.exports = { getAsyncFromRedis, redisClient }
