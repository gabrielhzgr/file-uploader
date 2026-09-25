async function createFolder(e, parentId) {
  try {
    const dropZone = document.querySelector(".main.drop-zone");
    const modalFolder = document.querySelector("#modal-folder");
    const modalDuplicate = document.querySelector("#modal-duplicate-actions");
    const name = e.target.querySelector('input[name="name"]').value;
    const formData = new FormData();
    formData.append("name", name);
    e.preventDefault();

    e.target.querySelectorAll("button, input").forEach((element) => {
      element.disabled = true;
    });

    let newFolder = document.createElement("div");
    newFolder.innerHTML = `<div class="content folder drop-zone" ondragover="dragOverHandler(event)" ondrop="dropHandler(event)" ondragleave="dragLeaveHandler(event)" ">
        <span class="material-symbols-outlined">
          folder
        </span>
        <span class="info">
        </span>
      </div>`;
    newFolder = newFolder.firstElementChild;

    function success(data) {
      newFolder.setAttribute("id", data.id);
      newFolder.onclick = (e) => (window.location = `/storage/${data.id}/`);
      newFolder.querySelector(".info").innerText = data.name;
      newFolder.classList.add("uploaded");
      dropZone.append(newFolder);
      modalFolder.classList.remove("active");
      modalDuplicate.classList.remove("active");
      e.target.querySelectorAll("button, input").forEach((element) => {
        element.disabled = false;
      });
    }

    async function fetchFolder() {
      try {
        const response = await fetch(`/storage/${parentId}/create/folder`, {
          method: "POST",
          body: formData,
        });
        return response;
      } catch (err) {
        throw err;
      }
    }

    async function replace() {
      try {
        formData.append("action", "replace");
        const response = await fetchFolder();
        if (response.status == 200) {
          const { newFolder } = await response.json();
          success(newFolder);
        } else {
          throw new Error("Error uploading");
        }
      } catch (err) {
        throw err;
      } finally {
        let newNode = modalDuplicate.cloneNode();
        modalDuplicate.parentNode.replaceChild(newNode, modalDuplicate);
      }
    }

    async function rename() {
      try {
        formData.append("action", "rename");
        const response = await fetchFolder();
        if (response.status == 200) {
          const { newFolder } = await response.json();
          success(newFolder);
        } else {
          throw new Error("Error uploading");
        }
      } catch (err) {
        throw err;
      } finally {
        let newNode = modalDuplicate.cloneNode();
        modalDuplicate.parentNode.replaceChild(newNode, modalDuplicate);
      }
    }

    const response = await fetchFolder();
    if (response.status == 200) {
      const { newFolder } = await response.json();
      success(newFolder);
    } else {
      modalDuplicate.classList.add("active");
      const btnReplace = modalDuplicate.querySelector(".button.replace");
      btnReplace.addEventListener("click", replace);
      const btnRename = modalDuplicate.querySelector(".button.rename");
      btnRename.addEventListener("click", rename);
    }
  } catch (err) {
    alert(err);
  }
}

export default createFolder;
