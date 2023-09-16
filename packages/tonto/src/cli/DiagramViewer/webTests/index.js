const body = document.getElementsByTagName("body")[0];
const content = document.querySelector('.content');

let isDragging = false;
let mouseDownX = 0;
let mouseDownY = 0;

body.addEventListener('mousedown', (e) => {
  isDragging = true;
  
  mouseDownX = e.clientX;
  mouseDownY = e.clientY;
  leftMargin = content.style.marginLeft.slice(0, -2);
  topMargin = content.style.marginTop.slice(0, -2);
});

body.addEventListener('mouseup', () => {
  isDragging = false;
});

body.addEventListener('mousemove', (e) => {
  if(!isDragging) return;

  content.style.marginLeft = `${((Number(e.clientX) - Number(mouseDownX))*2 + Number(leftMargin))}px`;
  content.style.marginTop = `${((Number(e.clientY) - Number(mouseDownY))*2 + Number(topMargin))}px`;
});

// ZOOM DIAGRAM
var zoom = 1;
body.addEventListener('wheel', (e) => {
    
  // Calculate the new zoom level based on the mouse scroll
  scroll = zoom < 2? e.deltaY * 0.001 : e.deltaY * 0.003;
  zoom = zoom - scroll;
  zoom = Math.max(zoom, 0.3);

  // Apply the new zoom levels
  content.style.transform = `scale(${zoom})`;
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

// Make the breakline between the stereotype and the name
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

// Make the dashed line bellow the genSet
const elements = document.querySelector("body > div > svg > g > g > g:nth-child(2) > g");
const genSet = ["{disjoint, complete}", "{disjoint, incomplete}", "{overlapping, complete}", "{overlapping, incomplete}"];
for (let i = 0; i < elements.childElementCount; i++) {
  const child = elements.children.item(i);

  if(child.tagName === "text" && genSet.includes(child.textContent.split("-")[0])){
    let dashedLine = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    
    const points = elements.children.item(i + 1).getAttribute("d").split(" ").slice(-3, -1);
    const X = Number(points[0].slice(1));
    const Y = Number(points[1]);
    
    const genSets = Number(child.textContent.split("-")[1]) | 1;
    child.textContent = child.textContent.split("-")[0];
    
    console.log(X, Y, genSets);

    dashedLine.setAttribute("d", `M${X-(genSets*95)} ${Y-1} L${X+(genSets*95)} ${Y-1}`);
    dashedLine.setAttribute("stroke-dasharray", "5, 5");

    elements.appendChild(dashedLine);
  }
}