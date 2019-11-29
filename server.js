const path = require('path')
const express = require('express')
const { position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('./package.json')).logName} / ${__filename.split(path.sep).pop().split('.js').shift()}]`, ...messages)

const app = express()

app.use('/solutions', express.static(fromHere('solutions')))

const port = 8080
app.listen(port, () => report(`Listening on http://localhost:${port}/`))
