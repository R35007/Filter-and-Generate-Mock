try {
  let enterTarget = null;
  let dataDropArea = document.getElementById("data-drop-area");

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e) {
    showLoader();
    let dt = e.dataTransfer;
    let files = dt.files;
    if (files[0]) {
      setFileData(files[0], "data");
    } else {
      hideLoader();
    }
  }

  function highlight(e) {
    enterTarget = e.target;
    dataDropArea.classList.add("highlight");
  }

  function unHighlight(e) {
    if (enterTarget == e.target) dataDropArea.classList.remove("highlight");
  }

  $(document).ready(function () {
    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      dataDropArea.addEventListener(eventName, preventDefaults, false);
    });

    ["dragenter", "dragover"].forEach((eventName) => {
      dataDropArea.addEventListener(eventName, highlight, false);
    });

    ["dragleave", "drop"].forEach((eventName) => {
      dataDropArea.addEventListener(eventName, unHighlight, false);
    });

    dataDropArea.addEventListener("drop", handleDrop, false);
  });
} catch (err) {
  console.error(err);
  hideLoader();
  alert(err);
}
