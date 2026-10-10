const prisma = require("../lib/prisma");
const supabase = require("../lib/supabase");
const path = require("node:path");
const CustomNotFoundError = require("../errors/CustomNotFoundError");
const fs = require("node:fs");
const fsPromises = require("node:fs/promises");
const { zip } = require("zip-a-folder");
const { getFolderContents } = require("../generated/prisma/sql");

async function getStorageIndex(req, res, next) {
  try {
    if (!req.isAuthenticated()) {
      return res.render("storage", { title: "Storage" });
    }
    const rootFolder = await prisma.folder.findFirst({
      where: { parentFolderId: null, ownerId: req.user.id },
    });
    req;
    res.redirect(`/storage/${rootFolder.id}`);
  } catch (err) {
    throw err;
  }
}

async function getFolder(req, res, next) {
  try {
    const folderId = req.params.folderId || req.folder.id;
    const { folder } = req;
    const contents = await prisma.$queryRawTyped(getFolderContents(folderId));
    if (!folder) {
      const err = new CustomNotFoundError("This folder could not be found");
      throw err;
    }
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
    const { id, name, action } = req.body;
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
        await prisma.$queryRaw`SELECT create_folder(${data.id},${data.name}, ${folderId}, ${data.ownerId})`;
      newFolder = newFolder[0].create_folder;
      return res.json({ newFolder });
    } else if (action == "replace") {
      const existingFolder = await prisma.folder.findFirst({
        where: { parentFolderId: folderId, name },
        include: {
          subFolders: true,
          files: true,
        },
      });
      if (existingFolder) {
        await removeFolder(existingFolder);
      }
      const newFolder = await prisma.folder.create({ data });
      return res.json({ newFolder, existingFolder });
    }
  } catch (err) {
    next(err);
  }
}

async function removeFolder(folder) {
  try {
    if (!("subFolders" in folder && "files" in folder)) {
      folder = await prisma.folder.findFirst({
        where: { id: folder.id },
        include: {
          subFolders: true,
          files: true,
        },
      });
    }
    for (const file of folder.files) {
      await removeFile(file);
    }
    for (let subfolder of folder.subFolders) {
      await removeFolder(subfolder);
    }
    await prisma.folder.delete({ where: { id: folder.id } });
  } catch (err) {
    throw err;
  }
}

async function removeFile(file, ownerId) {
  const { id, name } = file;
  await prisma.file.delete({ where: { id } });
  await supabase.storage.from(ownerId).remove([`${id}/${name}`]);
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
      sizeInBytes: file.size,
    };
    let startUploadFile = performance.now();

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
        let endUploadFile = performance.now();
        console.log(
          `It took ${(endUploadFile - startUploadFile) / 1000} seconds to upload file ${data.name} with no duplicates`,
        );
        console.log(
          "=======================================================================",
        );

        return res.json({ newFile });
      }
    } else if (action == "rename") {
      let newFile =
        await prisma.$queryRaw`SELECT create_file(${crypto.randomUUID()},${data.name}, ${data.folderId}, ${data.mimetype}, ${data.sizeInBytes})`;
      newFile = newFile[0].create_file;
      await supabase.storage
        .from(user.id)
        .upload(path.join(newFile.id, newFile.name), file.buffer, {
          contentType: file.mimetype,
        });
      res.json({ newFile });
    } else if (action == "replace") {
      const start = performance.now();
      const startFindFile = performance.now();
      const existingFile = await prisma.file.findFirst({
        where: { folderId, name: file.originalname },
      });
      const endFindFile = performance.now();
      console.log(
        `It took ${(endFindFile - startFindFile) / 1000} seconds to find existing file`,
      );
      if (existingFile) {
        const startremoveFile = performance.now();
        await removeFile(existingFile, user.id);
        const endremoveFile = performance.now();
        console.log(
          `It took ${(endremoveFile - startremoveFile) / 1000} seconds to delete existing file`,
        );
      }
      const startCreateFile = performance.now();
      const newFile = await prisma.file.create({ data });
      const endCreateFile = performance.now();
      console.log(
        `It took ${(endCreateFile - startCreateFile) / 1000} seconds to create new file in db`,
      );
      const startUploadFile = performance.now();
      await supabase.storage
        .from(user.id)
        .upload(path.join(newFile.id, newFile.name), file.buffer, {
          contentType: file.mimetype,
        });
      const endUploadFile = performance.now();
      console.log(
        `It took ${(endUploadFile - startUploadFile) / 1000} seconds to upload file in bucket`,
      );

      const end = performance.now();
      console.log(
        `It took ${(end - start) / 1000} seconds to upload file ${data.name} with replacing`,
      );

      console.log("===================================================");

      return res.json({ existingFile, newFile });
    }
  } catch (err) {
    next(err);
  }
}

async function downloadFile(req, res, next) {
  try {
    const { user } = req;
    const { fileId } = req.params;

    const file = await prisma.file.findFirst({ where: { id: fileId } });

    const { data, error } = await supabase.storage
      .from(user.id)
      .download(`${fileId}/${file.name}`);

    res.type(data.type);
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-disposition", `filename=${file.name}`);
    data.arrayBuffer().then((buf) => {
      res.send(Buffer.from(buf));
    });
  } catch (err) {
    throw err;
  }
}

async function downloadFolder(req, res, next) {
  try {
    const { id } = req.params;
    const { name } = req.query;
    const folder = await prisma.folder.findFirst({
      where: { id },
      include: { subFolders: true, files: true },
    });
    const tmpPath = path.join(__dirname, "..", "tmp", folder.id);
    const tmpPathDir = path.join(tmpPath, folder.name);
    const tmpPathZip = path.join(tmpPath, `${folder.name}.zip`);
    // const data = await fs.readFile(path.join(tmp, `${name}.zip`), {
    //   encoding: "utf8",
    // });

    await makeTempFolder(tmpPathDir, folder, req.user.id);
    await zip(tmpPathDir, tmpPathZip);
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-disposition", `attachment;filename=${name}.zip`);
    let readStream = fs.createReadStream(tmpPathZip);
    readStream.pipe(res);
    await fsPromises.rm(tmpPath, { recursive: true });
  } catch (err) {
    throw err;
  }
}

async function makeTempFolder(tmpPath = "", folder, ownerId) {
  try {
    if (!("subFolders" in folder && "files" in folder)) {
      folder = await prisma.folder.findFirst({
        where: { id: folder.id },
        include: {
          subFolders: true,
          files: true,
        },
      });
    }
    for (let subfolder of folder.subFolders) {
      await makeTempFolder(
        path.join(tmpPath, subfolder.name),
        subfolder,
        ownerId,
      );
    }

    await fsPromises.mkdir(tmpPath, { recursive: true });

    for (const file of folder.files) {
      const { data, error } = await supabase.storage
        .from(ownerId)
        .download(`${file.id}/${file.name}`);
      const buf = await data.arrayBuffer();

      await fsPromises.writeFile(
        path.join(tmpPath, file.name),
        Buffer.from(buf),
      );
    }
  } catch (err) {
    throw err;
  }
}

async function deleteFile(req, res, next) {
  try {
    const { id } = req.params;
    const file = await prisma.file.findFirst({ where: { id } });
    await removeFile(file, req.user.id);
    res.json({ deletedFile: file });
  } catch (err) {
    throw err;
  }
}

async function deleteFolder(req, res, next) {
  try {
    const { id } = req.params;
    const folder = await prisma.folder.findFirst({ where: { id } });
    await removeFolder(folder, req.user.id);
    res.json({ deletedFolder: folder });
  } catch (err) {
    throw err;
  }
}

async function getDetailsFile(req, res, next) {
  try {
    const { id } = req.params;
    let file = await prisma.file.findFirst({ where: { id } });
    file.sizeInBytes = humanReadableBytes(file.sizeInBytes);

    res.render("detailsFile", {
      title: `${file.name} | Details`,
      content: file,
      folder: req.folder,
    });
  } catch (err) {
    throw err;
  }
}

async function getDetailsFolder(req, res, next) {
  try {
    const { id } = req.params;
    let folder = await prisma.folder.findFirst({ where: { id } });
    res.render("detailsFolder", {
      title: `${folder.name} | Details`,
      content: folder,
      folder: req.folder,
    });
  } catch (err) {
    throw err;
  }
}

async function getFolderSize(req, res, next) {
  try {
    const { id } = req.params;
    let folder = await prisma.folder.findFirst({ where: { id } });
    const start = performance.now();
    let size = await getFolderSizeBytes(folder);
    const end = performance.now();
    console.log(
      `====Took ${(end - start) / 1000} seconds to get folder size===`,
    );
    size = humanReadableBytes(size);
    res.json({ size });
  } catch (err) {
    throw err;
  }
}

async function getFolderSizeBytes(folder) {
  try {
    let bytes = 0;
    if (!("subFolders" in folder && "files" in folder)) {
      folder = await prisma.folder.findFirst({
        where: { id: folder.id },
        include: {
          subFolders: true,
          files: true,
        },
      });
    }
    for (const file of folder.files) {
      bytes += file.sizeInBytes;
    }
    for (let subfolder of folder.subFolders) {
      bytes += await getFolderSizeBytes(subfolder);
    }
    return bytes;
  } catch (err) {
    throw err;
  }
}

function humanReadableBytes(bytes) {
  if (bytes === 0) {
    return "0.00 B";
  }

  let e = Math.floor(Math.log(bytes) / Math.log(1024));
  return (
    (bytes / Math.pow(1024, e)).toFixed(2) + " " + " KMGTP".charAt(e) + "B"
  );
}
async function renameFile(req, res, next) {
  try {
    const { name } = req.body;
    const { id, folderId } = req.params;

    const existing = await prisma.file.findFirst({
      where: { folderId, name },
    });

    if (existing) {
      return res.status(300).json(existing);
    } else {
      const file = await prisma.file.findFirst({ where: { id } });
      const renamed = await prisma.file.update({
        where: { id },
        data: { name },
      });
      await supabase.storage
        .from(req.user.id)
        .move(`${file.id}/${file.name}`, `${file.id}/${name}`);
      res.json(renamed);
    }
  } catch (err) {
    throw err;
  }
}

async function renameFolder(req, res, next) {
  try {
    const { name } = req.body;
    const { id, folderId } = req.params;

    const existing = await prisma.folder.findFirst({
      where: { parentFolderId: folderId, name },
    });
    if (existing) {
      return res.status(300).json(existing);
    } else {
      const renamed = await prisma.folder.update({
        where: { id },
        data: { name },
      });
      res.json(renamed);
    }
  } catch (err) {
    throw err;
  }
}

async function createSharedLink(req, res, next) {
  try {
    //TODO: Test this
    const { folderId } = req.params;
    const { expiresAt } = req.body;
    const sharedFolder = await prisma.sharedFolder.create({
      data: { expiresAt, folderId },
    });
    res.json({ link: `${req.get("host")}/storage/shared/${sharedFolder.id}` });
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getStorageIndex,
  getFolder,
  createSharedLink,
  uploadFile,
  createFolder,
  createFolders,
  downloadFile,
  downloadFolder,
  deleteFile,
  deleteFolder,
  getDetailsFile,
  getDetailsFolder,
  getFolderSize,
  renameFile,
  renameFolder,
};
