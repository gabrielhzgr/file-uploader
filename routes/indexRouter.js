const express = require('express')
const indexRouter = express.Router()
const indexController = require('../controllers/indexControllers.js')
indexRouter.get('/',indexController.getIndex)
module.exports = indexRouter