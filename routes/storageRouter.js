const express = require('express')
const storageRouter = express.Router()
const storageControllers = require('../controllers/storageControllers')
const {isAuthenticated, isOwner} = require('../controllers/authMiddleware.js')
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({storage})

storageRouter.get('/',storageControllers.getStorageIndex)
storageRouter.get('/:folderId', isAuthenticated, isOwner, storageControllers.getFolder)
storageRouter.post('/:folderId/upload/file', isAuthenticated, isOwner, upload.single('file'), storageControllers.uploadFileToFolder)
module.exports = storageRouter
