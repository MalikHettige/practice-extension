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

const STYLE_PROPS = [
  "fill", "fill-opacity", "fill-rule",
  "stroke", "stroke-width", "stroke-opacity",
  "stroke-linecap", "stroke-linejoin", "stroke-dasharray",
  "stop-color", "stop-opacity",
  "opacity", "color", "display", "visibility",
];

// Copy the effective styles from the live SVG onto the clone, element by element
const inlineStyles = (orig, clone) => {
  const o = [orig, ...orig.querySelectorAll("*")];
  const c = [clone, ...clone.querySelectorAll("*")];
  o.forEach((el, i) => {
    const cs = getComputedStyle(el);
    STYLE_PROPS.forEach((p) => {
      c[i].style.setProperty(p, cs.getPropertyValue(p));
    });
  });
};

  const onClick = (e) => {
    const svg = findSvg(e.target);
    if (!svg) return; // clicks outside an SVG behave normally
    e.preventDefault();
    e.stopPropagation();
    stop(); // removes our outline before we copy the SVG

    const clone = svg.cloneNode(true);
      inlineStyles(svg, clone); // <-- the new line
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