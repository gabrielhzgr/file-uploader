const express = require('express')
const driveRouter = express.Router()
const driverControllers = require('../controllers/driveControllers')

driveRouter.get('/',driverControllers.getDriveIndex)

module.exports = driveRouter
