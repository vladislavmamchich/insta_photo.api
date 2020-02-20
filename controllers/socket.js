require('dotenv').config()
const { JWT_SECRET, SOCKET_PORT } = process.env

const app = require('../app')
const http = require('http').Server(app)
const io = require('socket.io')(http)
const jwt = require('jsonwebtoken')
const User = require('../db/models/User')

io.set('transports', ['polling'])

// app.set('forward', ({ room, message, receiver }) => {
//     console.log('forward', room)
//     io.to(room).emit('new_message', message)
//     if (receiver >= 0) {
//         io.to(receiver).emit('new_group', { room })
//     }
// })

// app.set('new_dialog', ({ sender, receiver, room }) => {
//     console.log('new_group')
//     io.to(sender).emit('new_group', { room })
//     io.to(receiver).emit('new_group', { room })
// })

const { likeImage } = require('../controllers/users')

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

    // socket.on('subscribe_to_group', async ({ room }, cb) => {
    //     try {
    //         console.log('subscribe_to_group', room)
    //         socket.join(room)
    //         const dialog = await getPopulatedDialogByRoom(room)
    //         cb({ dialog })
    //     } catch (err) {
    //         console.log(err)
    //         socket.emit('server_error', err.message)
    //     }
    // })

    // socket.on('view', async ({ room, viewer }) => {
    //     try {
    //         // console.log('view', data)
    //         let { dialog_id, company_id, msg } = await viewDialog({
    //             room,
    //             viewer
    //         })
    //         socket
    //             .to(room)
    //             .emit('dialog_opened', { viewer, dialog_id, company_id, msg })
    //     } catch (err) {
    //         console.log(err)
    //         socket.emit('server_error', err.message)
    //     }
    // })

    // socket.on('leave', async ({ room, viewer }) => {
    //     try {
    //         // console.log('leave')
    //         let { dialog_id, msg, company_id } = await leaveDialog({
    //             room,
    //             viewer
    //         })
    //         socket
    //             .to(room)
    //             .emit('leave', { dialog_id, msg, company_id, viewer })
    //     } catch (err) {
    //         console.log(err)
    //         socket.emit('server_error', err.message)
    //     }
    // })

    socket.on('like', async ({ image_id }) => {
        try {
            const { likedUser } = await likeImage({ user_id: _id, image_id })
            io.emit('like', { user_id: _id, image_id })
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
