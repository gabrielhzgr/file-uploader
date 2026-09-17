const express = require("express");
const storageRouter = express.Router();
const storageControllers = require("../controllers/storageControllers");
const {
  isAuthenticated,
  isOwner,
} = require("../controllers/authMiddleware.js");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage, preservePath: true });

storageRouter.get("/", storageControllers.getStorageIndex);
storageRouter.get(
  "/:folderId",
  isAuthenticated,
  isOwner,
  storageControllers.getFolder,
);
storageRouter.post(
  "/:folderId/upload/file",
  isAuthenticated,
  isOwner,
  upload.single("file"),
  storageControllers.uploadFile,
);

storageRouter.post(
  "/:folderId/create/folder",
  isAuthenticated,
  isOwner,
  upload.none(),
  storageControllers.createFolder,
);

module.exports = storageRouter;
