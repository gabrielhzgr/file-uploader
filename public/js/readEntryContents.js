async function readEntryContents(entry, parentId) {
  if (!entry.isDirectory) {
    let file = await new Promise(function (resolve, reject) {
      try {
        entry.file(function (file) {
          resolve(file);
        });
      } catch (err) {
        reject(err);
      }
    });
    return {
      fileObjects: [
        {
          file,
          parentId,
        },
      ],
      folders: [],
    };
  } else {
    const { fileObjects, folders } = await new Promise(function (
      resolve,
      reject,
    ) {
      let fileObjects = [];
      let folderId = crypto.randomUUID();
      let folders = [
        {
          name: entry.name,
          id: folderId,
          parentId,
        },
      ];
      entry.createReader().readEntries(async function (entries) {
        for (const entry of entries) {
          let result = await readEntryContents(entry, folderId);
          fileObjects = [...fileObjects, ...result.fileObjects];
          folders = [...folders, ...result.folders];
        }
        resolve({
          fileObjects,
          folders,
        });
      });
    });
    return {
      fileObjects,
      folders,
    };
  }
}

export default readEntryContents;
