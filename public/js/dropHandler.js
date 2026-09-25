import traverseDropItems from "./traverseItems.js";

async function dropHandler(e) {
  try {
    e.preventDefault();
    if (e.currentTarget.classList.contains("drop-zone")) {
      e.stopPropagation();
      const folderId = e.currentTarget.id;
      await traverseDropItems(e);
    }
  } catch (err) {
    console.log(err);
  }
}

export default dropHandler;
