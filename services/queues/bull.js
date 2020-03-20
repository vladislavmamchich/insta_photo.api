const Bull = require('bull')
require('dotenv').config()
const { REDIS_HOST, REDIS_PORT } = process.env

const redis = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  maxRetriesPerRequest: null,
  connectTimeout: 180000
}

const defaultJobOptions = {
  removeOnComplete: true,
  removeOnFail: false
}

const limiter = {
  max: 10000,
  duration: 1000,
  bounceBack: false
}

const settings = {
  lockDuration: 30000, // Key expiration time for job locks.
  lockRenewTime: 15000, // Interval on which to acquire the job lock
  stalledInterval: 30000, // How often check for stalled jobs (use 0 for never checking).
  maxStalledCount: 1, // Max amount of times a stalled job will be re-processed.
  guardInterval: 5000, // Poll interval for delayed jobs and added jobs.
  retryProcessDelay: 5000, // delay before processing next job in case of internal error.
  drainDelay: 5 // A timeout for when the queue is in drained state (empty waiting for jobs).
}

const bull = new Bull('my_queue', {
  redis,
  defaultJobOptions,
  settings,
  limiter
})

bull.process('compressImages', 1, `${__dirname}/compressImages.js`)

module.exports = { bull }
