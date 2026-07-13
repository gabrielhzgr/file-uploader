const express = require('express')
const indexRouter = express.Router()
const indexController = require('../controllers/indexControllers.js')
const usersRouter = require('./usersRouter.js')

indexRouter.get('/',indexController.getIndex)
indexRouter.use('/users', usersRouter)
indexRouter.get('/drive', indexController.getDrive)

module.exports = indexRouter