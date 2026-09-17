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
    const { id, name, action } = req.body;
    const { folderId } = req.params;
    const data = { id, name, parentFolderId: folderId, ownerId: user.id };
    if (id) {
      data.id = id;
    }

    const nameExists = await prisma.folder.findFirst({
      where: { id, name },
    });

    if (!nameExists) {
      const newFolder = await prisma.folder.create({ data });
      return res.json(newFolder);
    } else if (nameExists && !action) {
      return res.status(300).send();
    } else if (nameExists && action == "rename") {
      let { altIndexesMissing, lastAltIndex } = altName(
        nameExists.altIndexesMissing,
        nameExists.lastAltIndex,
      );
      nameExists.altIndexesMissing = altIndexesMissing;
      nameExists.lastAltIndex = lastAltIndex;

      let nameWithSuffix = `${nameExists.name} (${nameExists.lastAltIndex})`;
      data.name = nameWithSuffix;

      const newFolder = await prisma.folder.create({ data });
      const updatedFolder = await prisma.folder.update({
        where: { id: nameExists.id },
        data: nameExists,
      });
      return res.json(newFolder);
    } else if (nameExists && action == "replace") {
      //TODO: Action replace
    }
  } catch (err) {
    next(err);
  }
}

function altName(altIndexesMissing = [], lastAltIndex) {
  if (altIndexesMissing.length == 0 && !lastAltIndex) {
    lastAltIndex = 1;
  } else if (altIndexesMissing.length == 0 && lastAltIndex) {
    lastAltIndex += 1;
  } else if (altIndexesMissing.length > 0 && !lastAltIndex) {
    lastAltIndex = altIndexesMissing.shift();
  }

  return { altIndexesMissing, lastAltIndex };
}

async function uploadFile(req, res, next) {
  try {
    const { file, user } = req;
    const { action } = req.body;
    const { folderId } = req.params;

    let data = {
      name: file.originalname,
      mimetype: file.mimetype,
      folderId: folderId,
    };

    const nameExists = await prisma.file.findFirst({
      where: { folderId, name: file.originalname },
    });

    if (!nameExists) {
      const newFile = await prisma.file.create({ data });
      await supabase.storage
        .from(user.id)
        .upload(path.join(newFile.id, file.originalname), file.buffer, {
          contentType: file.mimetype,
        });
      return res.json(newFile);
    } else if (nameExists && !action) {
      return res.status(300).send();
    } else if (nameExists && action == "rename") {
      let { altIndexesMissing, lastAltIndex } = altName(
        nameExists.altIndexesMissing,
        nameExists.lastAltIndex,
      );
      nameExists.altIndexesMissing = altIndexesMissing;
      nameExists.lastAltIndex = lastAltIndex;

      let nameWithSuffix = `${nameExists.name} (${nameExists.lastAltIndex})`;
      data.name = nameWithSuffix;

      const newFile = await prisma.file.create({ data });
      const updatedFile = await prisma.file.update({
        where: { id: nameExists.id },
        data: nameExists,
      });
      await supabase.storage
        .from(user.id)
        .upload(path.join(newFile.id, file.originalname), file.buffer, {
          contentType: file.mimetype,
        });
      return res.json(newFile);
    } else if (nameExists && action == "replace") {
      //TODO: ACTION REPLACE
    }
  } catch (err) {
    next(err);
  }
}

//TODO: delete folder, delete file

module.exports = {
  getStorageIndex,
  getFolder,
  uploadFile,
  createFolder,
};
