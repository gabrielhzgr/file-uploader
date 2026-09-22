const { log } = require("node:console");
const prisma = require("../lib/prisma");
const supabase = require("../lib/supabase");
const path = require("node:path");
const { start } = require("node:repl");
//const getHierarchy = require("../lib/getHierarchy.js");

async function getStorageIndex(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.render("storage", { title: "Storage" });
  }
  const rootFolder = await prisma.folder.findFirst({
    where: { parentFolderId: null, ownerId: req.user.id },
  });
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

async function createFolder(req, res, next) {
  try {
    const { user } = req;
    const { id, name, action, existingId } = req.body;
    const { folderId } = req.params;
    const data = { id, name, parentFolderId: folderId, ownerId: user.id };
    if (id) {
      data.id = id;
    }
    if (!action) {
      const existingFolder = await prisma.folder.findFirst({
        where: { parentFolderId: folderId, name },
      });
      if (existingFolder) {
        return res.status(300).json({ existingFolder });
      } else {
        const newFolder = await prisma.folder.create({ data });
        return res.json({ newFolder });
      }
    } else if (action == "rename") {
      let newFolder =
        await prisma.$queryRaw`SELECT create_folder(${crypto.randomUUID()},${data.name}, ${folderId}, ${data.ownerId})`;
      newFolder = newFolder[0].create_folder;
      res.json({ newFolder });
    } else if (action == "replace") {
      const existingFolder = await prisma.folder.findFirst({
        where: { parentFolderId: folderId, name },
      });
      if (existingFolder) {
        await deleteFolder(existingFolder);
      }
      const newFolder = await prisma.folder.create({ data });
      return res.json({ newFolder });
    }
  } catch (err) {
    next(err);
  }
}

async function deleteFolder(folder) {
  try {
    const { id, parentFolderId } = folder;
    const files = await prisma.file.findMany({ where: { folderId: id } });
    const subfolders = await prisma.folder.findMany({
      where: { parentFolderId },
    });

    for (const file of files) {
      await deleteFile(file);
    }

    for (const subfolder of subfolders) {
      await deleteFolder(subfolder);
    }
    await prisma.folder.delete({ where: { id } });
  } catch (err) {
    throw err;
  }
}

async function deleteFile(file) {
  ///TODO: Test this when replacing or from a menu
  const { id, name } = file;
  await prisma.file.delete({ where: { id } });
  await supabase.storage.from(userId).remove([`${id}/${name}`]);
}

async function createFolders(req, res, next) {
  try {
    let { folders } = req.body;
    folders = JSON.parse(folders);

    const { user } = req;
    for (const folder of folders) {
      const { id, name, parentId } = folder;
      const data = { id, name, parentFolderId: parentId, ownerId: user.id };
      await prisma.folder.create({ data });
    }
    res.json(folders);
  } catch (err) {
    next(err);
  }
}

async function uploadFile(req, res, next) {
  try {
    const { file, user } = req;
    const { action, existingId } = req.body;
    const { folderId } = req.params;

    let data = {
      name: file.originalname,
      mimetype: file.mimetype,
      folderId: folderId,
    };

    if (!action) {
      const existingFile = await prisma.file.findFirst({
        where: { folderId, name: file.originalname },
      });
      if (existingFile) {
        res.status(300).send();
      } else {
        const newFile = await prisma.file.create({ data });
        await supabase.storage
          .from(user.id)
          .upload(path.join(newFile.id, file.originalname), file.buffer, {
            contentType: file.mimetype,
          });
        return res.json({ newFile });
      }
    } else if (action == "rename") {
      let newFile =
        await prisma.$queryRaw`SELECT create_file(${crypto.randomUUID()},${data.name}, ${data.folderId}, ${data.mimetype})`;
      newFile = newFile[0].create_file;
      res.json({ newFile });
    } else if (action == "replace") {
      const existingFile = await prisma.file.findFirst({
        where: { folderId, name: file.originalname },
      });
      if (existingFile) {
        deleteFile(existingFile);
      }
      const newFile = await prisma.file.create({ data });
      await supabase.storage
        .from(user.id)
        .upload(path.join(newFile.id, file.originalname), file.buffer, {
          contentType: file.mimetype,
        });
      return res.json({ newFile });
    }
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getStorageIndex,
  getFolder,
  uploadFile,
  createFolder,
  createFolders,
};
