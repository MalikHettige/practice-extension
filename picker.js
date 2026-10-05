const svgs = document.querySelectorAll("svg");
svgs.forEach((svg) => {
  svg.style.outline = "2px solid red";
});
console.log("SVGs found:", svgs.length);    