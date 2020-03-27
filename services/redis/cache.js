const User = require('../../db/models/User')
const Image = require('../../db/models/Image')
const { IMAGES_PER_PAGE } = require('../../config/server')
const { redisClient } = require('./client')
;(async () => {
    setTimeout(async function allLikes() {
        try {
            const users_ids = await User.find().distinct('_id')
            let totalLikes = {}
            for (const user_id of users_ids) {
                const images = await Image.find({ user: user_id })
                const total_likes = images.reduce(
                    (sum, cur) => sum + cur.likes.length,
                    0
                )
                totalLikes[user_id] = total_likes
                await Image.updateMany(
                    { user: user_id },
                    { $set: { total_likes } },
                    { multi: true }
                )
            }
            redisClient.set('totalLikes', JSON.stringify(totalLikes))
            setTimeout(allLikes, 1000)
        } catch (err) {
            console.log(err)
        }
    }, 1000)
})()
