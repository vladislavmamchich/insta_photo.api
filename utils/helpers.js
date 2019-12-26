const password = require('secure-random-password')
const fs = require('fs')
const jo = require('jpeg-autorotate')
const { mkdir } = fs.promises
require('dotenv').config()
const { SALT } = process.env

const generate_password = (length = 6) => {
    return password.randomPassword({ length, characters: password.digits })
}

const generateGroupRoom = (length = 10) => {
    return password.randomPassword({
        length,
        characters: [password.lower, password.upper]
    })
}

const generateRandom = (length = 32) => {
    return password.randomPassword({
        length,
        characters: [password.lower, password.upper]
    })
}

// const isValidJson = (json) => {
//  try {
//      JSON.parse(json)
//      return true
//  } catch (e) {
//      return false
//  }
// }

const criptMd5 = (info, salt = SALT) => {
    return require('salted-md5')(info, salt)
}

const verifyPassword = (password1, password2, salt = SALT) => {
    return criptMd5(password1, salt) === password2
}

const errorsObject = {
    '1': 'Invalid number of arguments',
    '2': 'Invalid argument(s)',
    '3': 'Empty argument(s) value(s)'
}

const isValidObject = (obj, fields) => {
    try {
        if (typeof obj === 'string') {
            if (!isValidJson(obj)) {
                throw 'Invalid JSON'
            } else {
                obj = JSON.parse(obj)
            }
        }
        let emptyArgument = Object.values(obj).some(val => val === '')
        let keys = Object.keys(obj)
        let invalidArgument = keys.some(val => !fields.includes(val))
        let valid = true,
            msg = null

        if (emptyArgument) {
            console.log(errorsObject['3'])
            valid = false
            msg = errorsObject['3']
        } else if (keys.length !== fields.length) {
            console.log(errorsObject['1'])
            valid = false
            msg = errorsObject['1']
        } else if (invalidArgument) {
            console.log(errorsObject['2'])
            valid = false
            msg = errorsObject['2']
        }
        return { valid, msg }
    } catch (err) {
        console.log(err)
        throw err
    }
}

const getTomorrow = () => {
    let tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow
}

const createDir = async dirpath => {
    try {
        await mkdir(dirpath, { recursive: true })
    } catch (err) {
        if (err.code !== 'EEXIST') throw err
    }
}

const myLogger = (req, res, next) => {
    // console.log(req)
    const ip =
        (req.headers['x-forwarded-for'] || '').split(',').pop() ||
        req.connection.remoteAddress

    console.log('\x1b[33m', '-'.repeat(50), '\x1b[0m')
    console.log('IP: ', ip)
    console.log(
        'Content-Type:',
        '\x1b[35m',
        req.headers['content-type'],
        '\x1b[0m'
    )
    console.log('Method:', '\x1b[32m', req.method, '\x1b[0m')
    console.log('Url:', '\x1b[32m', req.url, '\x1b[0m')
    console.log('Body:', req.body, '\x1b[0m')
    // console.log('Params', '\x1b[36m', req.params, '\x1b[0m')
    console.log('Query', '\x1b[36m', req.query, '\x1b[0m')
    console.log('Start time', '\x1b[36m', req._startTime)
    console.log('\x1b[31m', '-'.repeat(50), '\x1b[0m')
    next()
}

const isNumeric = number => {
    return !isNaN(parseFloat(number)) && isFinite(number)
}

const getUniq = async a => [...new Set(a)]

const rotateImage = async filePath => {
    try {
        const { buffer } = await jo.rotate(filePath, { quality: 85 })
        fs.writeFileSync(filePath, buffer)
    } catch (err) {
        console.log(err)
    }
}

const removeFolder = dirPath => {
    const rimraf = require('rimraf')
    rimraf(dirPath, function() {
        console.log('done')
    })
}

module.exports = {
    generate_password,
    criptMd5,
    verifyPassword,
    getTomorrow,
    createDir,
    myLogger,
    isNumeric,
    isValidObject,
    generateGroupRoom,
    getUniq,
    rotateImage,
    removeFolder,
    generateRandom
}
