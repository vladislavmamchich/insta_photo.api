const { REDIS_PORT } = process.env
const redis = require('redis')
const redisClient = redis.createClient(REDIS_PORT)
const { promisify } = require('util')
const getAsyncFromRedis = promisify(redisClient.get).bind(redisClient)

module.exports = { getAsyncFromRedis, redisClient }
