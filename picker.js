(() => {
  if (window.__svgPickerActive) return;

  const toast = (text) => {
    const t = document.createElement("div");
    t.textContent = text;
    t.style.cssText =
      "position:fixed;top:16px;right:16px;z-index:2147483647;" +
      "background:#222;color:#fff;padding:10px 14px;border-radius:6px;" +
      "font:14px system-ui,sans-serif;";
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  };

  if (!document.querySelector("svg")) {
    toast("No inline SVGs found on this page.");
    return;
  }

  window.__svgPickerActive = true;
  toast("Hover an SVG and click it. Esc to cancel.");

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

  // Copy the effective styles from the live SVG onto the clone
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

  // Replace <use href="#id"> with a copy of what it points to
  const resolveUses = (clone) => {
    clone.querySelectorAll("use").forEach((use) => {
      const href = use.getAttribute("href") || use.getAttribute("xlink:href");
      if (!href || !href.startsWith("#")) return; // external sprite file: skip
      const target = document.getElementById(href.slice(1));
      if (!target) return;

      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      const transform = use.getAttribute("transform");
      if (transform) g.setAttribute("transform", transform);
      g.style.cssText = use.style.cssText;

      if (target.tagName.toLowerCase() === "symbol") {
        const vb = target.getAttribute("viewBox");
        if (!clone.getAttribute("viewBox") && vb) {
          clone.setAttribute("viewBox", vb);
        }
        target.childNodes.forEach((n) => g.appendChild(n.cloneNode(true)));
      } else {
        g.appendChild(target.cloneNode(true));
      }
      use.replaceWith(g);
    });
  };

  const onClick = (e) => {
    const svg = findSvg(e.target);
    if (!svg) return; // clicks outside an SVG behave normally
    e.preventDefault();
    e.stopPropagation();
    stop(); // removes our outline before we copy the SVG

    const clone = svg.cloneNode(true);
    inlineStyles(svg, clone);
    resolveUses(clone);

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