const redis = require('redis')
const client = redis.createClient(6379)
const User = require('../db/models/User')
const Image = require('../db/models/Image')
const { IMAGES_PER_PAGE } = require('../config/server')
;(async () => {
    setTimeout(async function allLikes() {
        const users = await User.find()
        let totalLikes = {}
        for (const user of users) {
            const images = await Image.find({ user: user._id })
            const total = images.reduce((sum, cur) => sum + cur.likes.length, 0)
            totalLikes[user._id] = total
        }
        client.setex('totalLikes', 5000, JSON.stringify(totalLikes))
        setTimeout(allLikes, 4000)
    }, 4000)
})()
