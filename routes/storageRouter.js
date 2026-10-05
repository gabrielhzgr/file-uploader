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

storageRouter.post(
  "/:folderId/create/folders",
  isAuthenticated,
  isOwner,
  upload.none(),
  storageControllers.createFolders,
);

storageRouter.get(
  "/:folderId/download/file/:fileId",
  isAuthenticated,
  isOwner,
  storageControllers.downloadFile,
);

storageRouter.get(
  "/:folderId/download/folder/:id",
  isAuthenticated,
  isOwner,
  storageControllers.downloadFolder,
);

storageRouter.delete(
  "/:folderId/delete/file/:id",
  isAuthenticated,
  isOwner,
  storageControllers.deleteFile,
);

storageRouter.delete(
  "/:folderId/delete/folder/:id",
  isAuthenticated,
  isOwner,
  storageControllers.deleteFolder,
);

storageRouter.get(
  "/:folderId/details/file/:id",
  isAuthenticated,
  isOwner,
  storageControllers.getDetailsFile,
);

storageRouter.get(
  "/:folderId/details/folder/:id",
  isAuthenticated,
  isOwner,
  storageControllers.getDetailsFolder,
);

storageRouter.get(
  "/:folderId/folder/size/:id",
  isAuthenticated,
  isOwner,
  storageControllers.getFolderSize,
);

//TODO: Add routes renameFile, renameFolder, downloadFile, donwloadFolder,
// more info File, more info Folder, deleteFile, deleteFolder

module.exports = storageRouter;
