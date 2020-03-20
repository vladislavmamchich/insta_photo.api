require('dotenv').config()
const { JWT_SECRET, SOCKET_PORT } = process.env

const app = require('../app')
const http = require('http').Server(app)
const io = require('socket.io')(http, {
    pingInterval: 10000,
    pingTimeout: 60000,
    upgradeTimeout: 30000
})
const jwt = require('jsonwebtoken')
const User = require('../db/models/User')

io.set('transports', ['websocket'])

const { likeImage } = require('../controllers/users')

app.set('update_admin_users', ({ admin }) => {
    console.log('update_admin_users', admin)
    io.to(admin).emit('update_admin_users')
})

io.use((socket, next) => {
    let { query } = socket.handshake
    // console.log(query.token)
    if (query && query.token) {
        const bearer = query.token.split(' ')
        const bearerToken = bearer[1]
        jwt.verify(bearerToken, JWT_SECRET, (err, decoded) => {
            if (err) return next(new Error('Authentication error'))
            socket.decoded = decoded
            next()
        })
    } else {
        console.log('no token')
        next(new Error('Authentication error'))
    }
}).on('connection', socket => {
    const {
        decoded: { _id }
    } = socket

    socket.join(_id)

    socket.on('like', async ({ image_id }) => {
        try {
            const { likedUser, totalLikes } = await likeImage({
                user_id: _id,
                image_id
            })
            io.emit('like', { user_id: _id, image_id })
            io.emit('update_total_likes', { totalLikes })
        } catch (err) {
            console.log(err)
            socket.emit('server_error', err.message)
        }
    })

    socket.on('error', error => {
        console.log(error)
    })
    socket.on('disconnect', () => {
        console.log('disconnect')
    })
})

http.listen(SOCKET_PORT, () => {
    console.log('Socket server up and running at %s port', SOCKET_PORT)
})
