const prisma = require("../lib/prisma");
const supabase = require("../lib/supabase");
const path = require("node:path");

async function getStorageIndex(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.render("storage", { title: "Storage" });
  }
  const rootFolder = await prisma.folder.findFirst({
    where: { parentFolderId: null, ownerId: req.user.id },
  });
  //req.folder = rootFolder
  //req.url+=rootFolder.id
  //next()
  res.redirect(`/storage/${rootFolder.id}`);
}

async function getFolder(req, res, next) {
  try {
    const { folderId } = req.params;
    const { folder } = req;
    const contents = await prisma.$queryRawTyped(
      require("../generated/prisma/sql").getFolderContents(folderId),
    );
    res.render("storage", {
      title: `Storage | ${folder.name}`,
      folder,
      contents,
    });
  } catch (err) {
    next(err);
  }
}

async function uploadFileToFolder(req, res, next) {
  try {
    const { file, user } = req;
    const { folderId } = req.params;
    const newFile = await prisma.file.create({
      data: {
        name: file.originalname,
        mimetype: file.mimetype,
        folderId: folderId,
      },
    });
    await supabase.storage
      .from(user.id)
      .upload(path.join(newFile.id, file.originalname), file.buffer, {
        contentType: file.mimetype,
      });
    req.flash("success", "File uploaded succesfully");
    res.redirect(`/storage/${folderId}/`);
  } catch (err) {
    next(err);
  }
}

async function createFolder(req, res, next) {
  try {
    const { user } = req;
    const { name } = req.body;
    const { folderId } = req.params;

    await prisma.folder.create({
      data: { name, parentFolderId: folderId, ownerId: user.id },
    });
    res.redirect(`/storage/${folderId}/`);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getStorageIndex,
  getFolder,
  uploadFileToFolder,
  createFolder,
};
