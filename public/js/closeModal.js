function closeModal(event) {
  if (event.type == "keydown" && event.key == "Escape") {
    this.classList.remove("active");
  } else if (event.type == "click") {
    this.classList.remove("active");
  }
}

export default closeModal;
