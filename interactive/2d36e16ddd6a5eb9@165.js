export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["flare-2.json",new URL("./files/e65374209781891f37dea1e7a6e1c5e020a3009b8aedf113b4c80942018887a1176ad4945cf14444603ff91d3da371b3b0d72419fa8d2ee0f6e815732475d5de",import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], function(md){return(
md`Click to zoom in or out.`
)});
  main.variable(observer("chart")).define("chart", ["pack","data","d3","width","height","color", "words", "measureWidth", "lineHeight", "targetWidth", "lines", "textRadius"], function(pack,data,d3,width,height,color, words, measureWidth, lineHeight, targetWidth, lines, textRadius)
{
  const root = pack(data);
  let focus = root;
  let view;

  const svg = d3.create("svg")
      .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
      .style("display", "block")
      .style("margin", "0 -14px")
      .style("background", color(0))
      .style("cursor", "pointer")
      .on("click", (event) => zoom(event, root));

  const node = svg.append("g")
    .selectAll("circle")
    .data(root.descendants().slice(1))
    .join("circle")
      .attr("fill", d => d.children ? color(d.depth) : "white")
      .attr("pointer-events", d => !d.children ? "none" : null)
      .on("mouseover", function() { d3.select(this).attr("stroke", "#000"); })
      .on("mouseout", function() { d3.select(this).attr("stroke", null); })
      .on("click", (event, d) => focus !== d && (zoom(event, d), event.stopPropagation()));

  const label = svg.append("g")
      .style("font", "10px sans-serif")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
    .selectAll("text")
    .data(root.descendants())
    .join("text")
      .style("fill-opacity", d => d.parent === root ? 1 : 0)
      .style("display", d => d.parent === root ? "inline" : "none")
      .text(d => d.data.name);

  zoomTo([root.x, root.y, root.r * 2]);

  function zoomTo(v) {
    const k = width / v[2];

    view = v;

    label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
    node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
    node.attr("r", d => d.r * k);
  }

  function zoom(event, d) {
    const focus0 = focus;

    focus = d;

    const transition = svg.transition()
        .duration(event.altKey ? 7500 : 750)
        .tween("zoom", d => {
          const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
          return t => zoomTo(i(t));
        });

    label
      .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
      .transition(transition)
        .style("fill-opacity", d => d.parent === focus ? 1 : 0)
        .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
        .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
  }

  return svg.node();
}
);
  main.variable(observer("data")).define("data", ["FileAttachment"], function(FileAttachment){return(
FileAttachment("flare-2.json").json()
)});
  main.variable(observer("pack")).define("pack", ["d3","width","height"], function(d3,width,height){return(
data => d3.pack()
    .size([width, height])
    .padding(3)
  (d3.hierarchy(data)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value))
)});
  main.variable(observer("width")).define("width", function(){return(
932
)});
  main.variable(observer("height")).define("height", ["width"], function(width){return(
width
)});
  main.variable(observer("format")).define("format", ["d3"], function(d3){return(
d3.format(",d")
)});
  main.variable(observer("color")).define("color", ["d3"], function(d3){return(
d3.scaleLinear()
    .domain([0, 5])
    .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
    .interpolate(d3.interpolateHcl)
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@6")
)});
  main.variable(observer("words")).define("words", function(){return(
function(text) {
const words = text.split(/\s+/g); // To hyphenate: /\s+|(?<=-)/
if (!words[words.length - 1]) words.pop();
if (!words[0]) words.shift();
return words;
}
)});
main.variable(observer("measureWidth")).define("measureWidth", function()
{
const context = document.createElement("canvas").getContext("2d");
return text => context.measureText(text).width;
}
);
main.variable(observer("lineHeight")).define("lineHeight", function(){return(
18
)});
main.variable(observer("targetWidth")).define("targetWidth", ["measureWidth","lineHeight"], function(measureWidth,lineHeight){return(
text => Math.sqrt(measureWidth(text.trim()) * lineHeight)
)});
main.variable(observer("lines")).define("lines", ["measureWidth","targetWidth"], function(measureWidth,targetWidth){return(
function(words) {
let line;
let lineWidth0 = Infinity;
const lines = [];
for (let i = 0, n = words.length; i < n; ++i) {
  let lineText1 = (line ? line.text + " " : "") + words[i];
  let lineWidth1 = measureWidth(lineText1);
  if ((lineWidth0 + lineWidth1) / 2 < targetWidth(words.join(" ")) ) {
    line.width = lineWidth0 = lineWidth1;
    line.text = lineText1;
  } else {
    lineWidth0 = measureWidth(words[i]);
    line = {width: lineWidth0, text: words[i]};
    lines.push(line);
  }
}
return lines;
}
)});
main.variable(observer("textRadius")).define("textRadius", ["lineHeight"], function(lineHeight){return(
function(lines) {
let radius = 0;
for (let i = 0, n = lines.length; i < n; ++i) {
  const dy = (Math.abs(i - n / 2 + 0.5) + 0.5) * lineHeight;
  const dx = lines[i].width / 2;
  radius = Math.max(radius, Math.sqrt(dx ** 2 + dy ** 2));
}
return radius;
}
)});

  return main;
}
