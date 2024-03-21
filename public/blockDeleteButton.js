function submitDeleteForm() {
  document.getElementById("updateForm").action = "./delete";
  document.getElementById("updateForm").submit();
}

function blockDeleteButton() {
  const nameInput = document.querySelector('input[name="name"]');
  const deleteButton = document.querySelector(".DelButton");

  if (nameInput.value.length > 0) {
    deleteButton.disabled = true;
  } else {
    deleteButton.disabled = false;
  }
}

document
  .querySelector('input[name="name"]')
  .addEventListener("input", blockDeleteButton);
