export const setHTML = (nomnomlContent: string) => {
    console.log(nomnomlContent);
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Diagram</title>
    <style>
        ${CSS}
    </style>
</head>
<body>
    <div class="content">
        ${nomnomlContent}
    </div>
    <script>
        ${javaScript}
    </script>
</body>
</html>
`
}

const javaScript = `
const body = document.getElementsByTagName("body")[0];
const content = document.querySelector('.content');

let isDragging = false;
let mouseDownX = 0;
let mouseDownY = 0;
var left = 0;
var top = 0;

body.addEventListener('mousedown', (e) => {
  isDragging = true;
  body.classList.add('grabbing');
  
  mouseDownX = e.clientX;
  mouseDownY = e.clientY;
  leftMargin = content.style.marginLeft.slice(0, -2);
  topMargin = content.style.marginTop.slice(0, -2);
});

body.addEventListener('mouseup', (e) => {
  isDragging = false;
  body.classList.remove('grabbing');
});

body.addEventListener('mousemove', (e) => {
  if(!isDragging) return;

  content.style.marginLeft = \`\${((Number(e.clientX) - Number(mouseDownX))*2 + Number(leftMargin))}px\`;
  content.style.marginTop = \`\${((Number(e.clientY) - Number(mouseDownY))*2 + Number(topMargin))}px\`;
});

// ZOOM DIAGRAM
var zoom = 1;
body.addEventListener('wheel', (e) => {
    
  // Calculate the new zoom level based on the mouse scroll
  scroll = zoom < 2? e.deltaY * 0.001 : e.deltaY * 0.003;
  zoom = zoom - scroll;
  zoom = Math.min(Math.max(zoom, 0.5), 3);

  // Apply the new zoom levels
  content.style.transform = \`scale(\${zoom})\`;
});

// Sets background color of classes
// let background = document.querySelectorAll("body > div > svg > g > g > g:nth-child(2) > g > g > g:nth-child(1)");
// console.log(background);
// background.forEach(element => {
//   element.style.fill = "#ffffff";
// });

// Defina colors of arrows
const arrows = document.getElementsByTagName("path");
for (const arrow of arrows) {
    if((Math.floor(arrow.getTotalLength()) === 39) || ((Math.ceil(arrow.getTotalLength()) === 43 || Math.floor(arrow.getTotalLength()) === 43) && arrow.parentElement.getAttribute("fill") === "#eee8d5")){
        arrow.setAttribute("fill", "rgba(0,0,0,0)");
        arrow.style.fill = "rgba(0,0,0,0)";
    }
}

// Forma para diferenciar classes de labels das relações
// text.parentElement.parentElement.parentElement.childElementCount === 2

// Do the breakline between the stereotype and the name
// POSSIVEL ERRO: nao testei como lida com os nomes e estereotipos nas relações
const texts = document.getElementsByTagName("text");
for (const text of texts) {
    if(/«.*»/.test(text.textContent)){

        let stereotype = document.createElementNS("http://www.w3.org/2000/svg", 'tspan');
        let name = document.createElementNS("http://www.w3.org/2000/svg", 'tspan');
        [stereotype.textContent, name.textContent] = text.textContent.split(' ');
        
        const textBox = text.getBBox();

        stereotype.setAttribute('y', textBox.height/4);
        stereotype.setAttribute('x', text.getAttribute("x"));
        name.setAttribute('y', textBox.height/0.75);
        name.setAttribute('x', text.getAttribute("x"));
        
        text.textContent = '';

        text.appendChild(stereotype);
        text.appendChild(name);
    }
}

const elements = document.querySelector("body > div > svg > g > g > g:nth-child(2) > g");
const genSet = ["{disjoint, complete}", "{disjoint, incomplete}", "{overlapping, complete}", "{overlapping, incomplete}"];

for (let i = 0; i < elements.childElementCount; i++) {
  const child = elements.children.item(i);

  if(child.tagName === "text" && genSet.includes(child.textContent.split("-")[0])){

    const yValue = Number(child.getAttribute('y')) + 10;
    const xValue = Number(child.getAttribute('x')) + 30;

    child.setAttribute('y', yValue);
    child.setAttribute('x', xValue);
    
    let dashedLine = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    
    const points = elements.children.item(i + 1).getAttribute("d").split(" ");
    const numbersOnly = points.filter((elem, index) => index % 2 === 1);
    const maxY = Number(Math.max(...numbersOnly));
    const initialX = Number(points[0].slice(1));

    const genSets = Number(child.textContent.split("-")[1]);
    child.textContent = child.textContent.split("-")[0];

    dashedLine.setAttribute("d", \`M\${initialX-(genSets*95)} \${maxY-1} L\${initialX+(genSets*95)} \${maxY-1}\`);
    dashedLine.setAttribute("stroke-dasharray", "5, 5");

    elements.appendChild(dashedLine);
  }
}
`;

// codigo html/css para fazer a dashed line para o genSet.
// `<path stroke-dasharray="10,10" d="M73.0 115.0 L683.0 115.0"></path>`

const CSS = `
* {
    border: 0;
    margin: 0;
    padding: 0;
}

text, tspan{
    fill: black;
}

body {
    width: 100%;
    height: 100vh;
    padding: 0;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: grab;
    background: #f0fffe;
}  

div, svg {
    min-width: 100%;
    overflow: visible;
}

.grabbing {
    cursor: grabbing;
}
`;