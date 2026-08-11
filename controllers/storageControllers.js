const prisma = require("../lib/prisma");
const supabase = require("../lib/supabase");
const path = require("node:path");
//const getHierarchy = require("../lib/getHierarchy.js");

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

async function uploadFiles(req, res, next) {
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

async function uploadMultiple(req, res, next) {
  //DRAGDROP folders and files

  //TODO: Consider if appending folders in
  // formData instead of JSON.parse(req.body.folders)
  //here

  //TODO: Write transaction to insert folders in db

  //TODO: Write transaction to insert files in db

  //TODO: If name of folder already exists send a popup to user
  //to select if keep or replace folder

  //TODO: Write logic to check if directory already exists in
  //:folderId, example what if user uploaded folder named Webcam
  //to folder abc-123 but that folder already had a folder named Webcam
  //IF missing alt indexes IS empty and last alt index IS empty too
  //update last alt index to 1 then insert the folder as
  //"name of original folder (1)"
  //IF missing alt indexes IS NOT empty insert the folder as
  //"name of original folder (lowest missing alt index)""
  //then delete it from missing alt indexes
  //IF missing alt indexes IS EMPTY and last alt index IS NOT empty
  //insert the folder as "name of original folder (last_alt_index + 1)"
  //and update last alt index by incrementing it by 1

  // REPEAT SAME LOGIC  in uploadFiles with already existing name
  // on uploadFile endpoint

  try {
    console.log("hello from uploadFiles");
    const { files } = req;
    let { folders, rootFolder } = req.body;

    const hierarchy = {};
    //console.log(files);
    res.json({ prop1: "hola" });
  } catch (err) {
    next(err);
  }
  //TODO: Ver porque los files no llegan desde el fetch en storage.ejs
}

async function registerFolder(req, res, next) {
  try {
    const { user } = req;
    const { name } = req.body;
    const { folderId } = req.params;

    await prisma.folder.create({
      data: { name, parentFolderId: folderId, ownerId: user.id },
    });
  } catch (err) {
    throw err;
  }
}

async function createFolder(req, res, next) {
  try {
    await registerFolder(req, res, next);
    res.redirect(`/storage/${folderId}/`);
  } catch (err) {
    next(err);
  }
}

async function name(params) {}

module.exports = {
  getStorageIndex,
  getFolder,
  uploadFiles,
  uploadMultiple,
  createFolder,
};
