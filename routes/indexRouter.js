const express = require('express')
const indexRouter = express.Router()
const indexController = require('../controllers/indexControllers.js')

indexRouter.get('/',indexController.getIndex)
indexRouter.get('/drive', indexController.getDrive)

module.exports = indexRouter