const express = require("express");
const storageRouter = express.Router();
const storageControllers = require("../controllers/storageControllers");
const {
  isAuthenticated,
  isOwner,
  isValidShare,
  isShared,
  goToIsShared,
} = require("../controllers/authMiddleware.js");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage, preservePath: true });
//TODO: Test authMiddleware works as intended
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
  goToIsShared,
  isOwner,
  storageControllers.downloadFile,
);

storageRouter.get(
  "/:folderId/download/file/:fileId",
  isShared,
  storageControllers.downloadFile,
);

storageRouter.get(
  "/:folderId/download/folder/:id",
  goToIsShared,
  isOwner,
  storageControllers.downloadFolder,
);

storageRouter.get(
  "/:folderId/download/folder/:id",
  isShared,
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
  goToIsShared,
  isOwner,
  storageControllers.getDetailsFile,
);

storageRouter.get(
  "/:folderId/details/file/:id",
  isShared,
  storageControllers.getDetailsFile,
);

storageRouter.get(
  "/:folderId/details/folder/:id",
  goToIsShared,
  isOwner,
  storageControllers.getDetailsFolder,
);

storageRouter.get(
  "/:folderId/details/folder/:id",
  isShared,
  storageControllers.getDetailsFolder,
);

storageRouter.get(
  "/:folderId/folder/size/:id",
  goToIsShared,
  isOwner,
  storageControllers.getFolderSize,
);

storageRouter.get(
  "/:folderId/folder/size/:id",
  isShared,
  storageControllers.getFolderSize,
);

storageRouter.post(
  "/:folderId/rename/file/:id",
  isAuthenticated,
  isOwner,
  upload.none(),
  storageControllers.renameFile,
);

storageRouter.post(
  "/:folderId/rename/folder/:id",
  isAuthenticated,
  isOwner,
  upload.none(),
  storageControllers.renameFolder,
);

storageRouter.get("/shared/:shareId", isValidShare, (req, res, next) => {
  storageControllers.getFolder(req, res, next);
});

storageRouter.post(
  "/shared/create/link/:folderId",
  isAuthenticated,
  isOwner,
  upload.none(),
  storageControllers.createSharedLink,
);

//TODO: Add routes renameFile, renameFolder, downloadFile, donwloadFolder,
// more info File, more info Folder, deleteFile, deleteFolder

module.exports = storageRouter;
