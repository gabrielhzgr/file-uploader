import uploadItem from "./uploadItem.js";

async function changeHandler(e, parentId) {
  const file = e.target.files[0];

  const promise = new Promise((resolve, reject) => {
    promiseResolve = resolve;
    promiseReject = reject;
  });

  const checkedDuplicates = {
    promise,
    found: false,
    resolve: promiseResolve,
    reject: promiseReject,
  };

  await uploadItem(
    (isDirectory = false),
    parentId,
    (name = file.name),
    file,
    checkedDuplicates,
  );
}

export default changeHandler;
