function dragOverHandler(e) {
  e.preventDefault();
  if (e.currentTarget.classList.contains("drop-zone")) {
    e.stopPropagation();
    e.currentTarget.classList.add("active");
  }
}
