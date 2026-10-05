const markup = decodeURIComponent(location.hash.slice(1));
const img = document.getElementById("svg");
const stage = document.getElementById("stage");

// Render through <img>, not by injecting into the page
img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(markup);

document.querySelectorAll("[data-bg]").forEach((btn) => {
  btn.addEventListener("click", () => {
    stage.dataset.bg = btn.dataset.bg;
  });
});

document.getElementById("download").addEventListener("click", () => {
  const blob = new Blob([markup], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "icon.svg";
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById("copy").addEventListener("click", () => {
  navigator.clipboard.writeText(markup);
});