const User = require('../../db/models/User')
const Image = require('../../db/models/Image')
const { IMAGES_PER_PAGE } = require('../../config/server')
const { redisClient } = require('./client')
;(async () => {
    setTimeout(async function allLikes() {
        const users_ids = await User.find().distinct('_id')
        let totalLikes = {}
        for (const user_id of users_ids) {
            const images = await Image.find({ user: user_id })
            totalLikes[user_id] = images.reduce(
                (sum, cur) => sum + cur.likes.length,
                0
            )
        }
        redisClient.set('totalLikes', JSON.stringify(totalLikes))
        setTimeout(allLikes, 1000)
    }, 1000)
})()
