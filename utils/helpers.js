const password = require('secure-random-password')
const fs = require('fs')
const crypto = require('crypto')
const { mkdir } = fs.promises
const { SALT } = process.env

const secureRandom = (length = 10) => {
    return password.randomPassword({
        length,
        characters: [password.lower, password.upper, password.digits]
    })
}

const sha256Salt = (data, salt = SALT) => {
    const hmac = crypto.createHmac('sha256', salt)
    hmac.update(data)
    return hmac.digest('hex')
}

const verifyPassword = (password1, password2) => {
    return sha256Salt(password1) === password2
}
const getTomorrow = () => {
    let tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow
}
const createDir = async dirpath => {
    try {
        if (!fs.existsSync(dirpath)) {
            await mkdir(dirpath, { recursive: true })
        }
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
const getImageUrl = path => {
    return path.slice(path.indexOf('/'))
}

const weightConverter = (value, fromUnit, toUnit) => {
    if (fromUnit === 'kg' && toUnit === 'lb') {
        return +(value * 2.2046).toFixed(2)
    }
    if (fromUnit === 'lb' && toUnit === 'kg') {
        return +(value / 2.2046).toFixed(2)
    }
    return value
}
const heightConverter = (value, fromUnit, toUnit) => {
    if (fromUnit === 'cm' && toUnit === 'inch') {
        return +(value / 2.54).toFixed(2)
    }
    if (fromUnit === 'inch' && toUnit === 'cm') {
        return +(value * 2.54).toFixed(2)
    }
    return value
}

module.exports = {
    sha256Salt,
    verifyPassword,
    getTomorrow,
    createDir,
    myLogger,
    isNumeric,
    getUniq,
    rotateImage,
    removeFolder,
    secureRandom,
    getImageUrl,
    weightConverter,
    heightConverter
}
