(() => {
  // Don't start twice if the icon is clicked again
  if (window.__svgPickerActive) return;
  window.__svgPickerActive = true;

  let current = null;
  let prevOutline = "";

  // Find the outermost <svg> that contains the element
  const findSvg = (el) => {
    if (!(el instanceof Element)) return null;
    let svg = el.closest("svg");
    while (svg && svg.parentElement && svg.parentElement.closest("svg")) {
      svg = svg.parentElement.closest("svg");
    }
    return svg;
  };

  const clearHighlight = () => {
    if (current) {
      current.style.outline = prevOutline;
      current = null;
    }
  };

  const onOver = (e) => {
    const svg = findSvg(e.target);
    if (svg === current) return;
    clearHighlight();
    if (svg) {
      current = svg;
      prevOutline = svg.style.outline;
      svg.style.outline = "2px solid red";
    }
  };

  const stop = () => {
    clearHighlight();
    document.removeEventListener("mouseover", onOver, true);
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("keydown", onKey, true);
    window.__svgPickerActive = false;
  };

  const onClick = (e) => {
    const svg = findSvg(e.target);
    if (!svg) return; // clicks outside an SVG behave normally
    e.preventDefault();
    e.stopPropagation();
    stop(); // removes our outline before we copy the SVG

    const clone = svg.cloneNode(true);
    if (!clone.getAttribute("viewBox")) {
      const w = parseFloat(clone.getAttribute("width"));
      const h = parseFloat(clone.getAttribute("height"));
      if (w && h) clone.setAttribute("viewBox", `0 0 ${w} ${h}`);
    }
    clone.removeAttribute("width");
    clone.removeAttribute("height");

    const markup = new XMLSerializer().serializeToString(clone);
    chrome.runtime.sendMessage({ type: "OPEN_SVG", svg: markup });
  };

  const onKey = (e) => {
    if (e.key === "Escape") stop();
  };

  document.addEventListener("mouseover", onOver, true);
  document.addEventListener("click", onClick, true);
  document.addEventListener("keydown", onKey, true);
})();