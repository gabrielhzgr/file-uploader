const express = require('express')
const indexRouter = express.Router()
const indexController = require('../controllers/indexControllers.js')
const usersRouter = require('./usersRouter.js')
const driveRouter = require('./driveRouter.js')

indexRouter.get('/',indexController.getIndex)
indexRouter.use('/users', usersRouter)
indexRouter.use('/drive', driveRouter)

module.exports = indexRouter