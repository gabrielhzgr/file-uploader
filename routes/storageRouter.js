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
  "/:folderId/upload/files",
  isAuthenticated,
  isOwner,
  upload.array("file"),
  storageControllers.uploadFiles,
);
storageRouter.post(
  "/:folderId/upload/multiple",
  isAuthenticated,
  isOwner,
  upload.array("files"),
  storageControllers.uploadMultiple,
);

storageRouter.post(
  "/:folderId/create/folder",
  isAuthenticated,
  isOwner,
  storageControllers.createFolder,
);

storageRouter.post(
  "/:folderId/check/existing",
  isAuthenticated,
  isOwner,
  upload.array("rootItems"),
  storageControllers.checkExisting,
);

module.exports = storageRouter;
