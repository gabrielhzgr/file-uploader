const prisma = require("../lib/prisma");
const CustomNotFoundError = require("../errors/CustomNotFoundError");
const { check } = require("express-validator");
function isAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).render("401", { title: "Unauthorized" });
  }
  next();
}

async function isOwner(req, res, next) {
  try {
    let { user } = req;
    const { folderId } = req.params;
    const folder = await prisma.folder.findFirst({
      where: { id: folderId, ownerId: user.id },
    });
    if (!folder) {
      return res.status(401).render("401", { title: "Unauthorized" });
    }
    req.folder = folder;
    next();
  } catch (err) {
    next(err);
  }
}

async function isValidShare(req, res, next) {
  try {
    const { shareId } = req.params;
    const sharedFolder = await prisma.sharedFolder.findFirst({
      where: { id: shareId },
      include: { folder: true },
    });

    if (!sharedFolder) {
      throw new CustomNotFoundError("Invalid link");
    }

    if (new Date(sharedFolder.expiresAt) <= new Date()) {
      await prisma.sharedFolder.delete({ where: { id: sharedFolder.id } });
      return res.status(410).render("410", { title: "Expired" });
    }
    res.cookie("shareId", sharedFolder.id, {
      expires: new Date(sharedFolder.expiresAt),
    });
    req.folder = sharedFolder.folder;
    res.locals.isShared = true;
    next();
  } catch (err) {
    next(err);
  }
}

async function isShared(req, res, next) {
  try {
    const { shareId } = req.cookies;
    if (shareId) {
      return next();
    }
    res.status(401).render("401", { title: "Unauthorized" });
  } catch (err) {
    throw err;
  }
}

const goToIsShared = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next("route");
  }
  next();
};

module.exports = {
  isAuthenticated,
  isOwner,
  isValidShare,
  isShared,
  goToIsShared,
};
