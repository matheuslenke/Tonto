const body = document.getElementsByTagName("body")[0]; // body
const content = document.querySelector('.content'); // div with the svg
const elements = document.querySelector("body > div.content > svg > g > g > g:nth-child(2) > g"); // content of the svg

// Drag diagram based on the position of the click before start to drag
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

  content.style.marginLeft = `${((Number(e.clientX) - Number(mouseDownX))*1.5 + Number(leftMargin))}px`;
  content.style.marginTop = `${((Number(e.clientY) - Number(mouseDownY))*2 + Number(topMargin))}px`;
});

// Zoom diagram
var zoom = 1;
body.addEventListener('wheel', (e) => {
    
  scroll = zoom < 2? e.deltaY * 0.001 : e.deltaY * 0.003;
  zoom = zoom - scroll;
  zoom = Math.max(zoom, 0.3);

  // Apply the new zoom
  content.style.transform = `scale(${zoom})`;
});

// Defina colors of arrows
const arrows = document.getElementsByTagName("path");
for (const arrow of arrows) {
    if(Math.floor(arrow.getTotalLength()) >= 39 && Math.ceil(arrow.getTotalLength()) <= 46){
      if(arrow.parentElement.childElementCount === 1 && arrow.parentElement.getAttribute("fill") === '#33322E'){
        arrow.setAttribute('class', 'composition');
      } else {
        arrow.setAttribute("fill", "rgba(0,0,0,0)");
      }
  }
}

// Make the breakline between the stereotype and the name
const texts = document.getElementsByTagName("text");
for (const text of texts) {
    if(/«.*»/.test(text.textContent)){
      if(text.textContent.split(' ').length === 2){
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
    if(text.textContent.split('_').length === 2)
      text.textContent = text.textContent.split('_')[0];
}

// Make the dashed line bellow the genSet
// Fix the position of the cardinality and the relation end names
const genSet = ["{disjoint, complete}", "{disjoint, incomplete}", "{overlapping, complete}", "{overlapping, incomplete}"];
for (let i = 0; i < elements.childElementCount; i++) {
  const child = elements.children[i];

  if(child.tagName === "text" && genSet.includes(child.textContent.split("-")[0])){
    let dashedLine = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    
    const points = elements.children[i+1].getAttribute("d").split(" ").slice(-3, -1);
    const X = Number(points[0].slice(1));
    const Y = Number(points[1]);

    const genSets = Number(child.textContent.split("-")[1]) | 1;
    child.textContent = child.textContent.split("-")[0];
    
    dashedLine.setAttribute("d", `M${X-(genSets*80)} ${Y-1} L${X+(genSets*80)} ${Y-1}`);
    dashedLine.setAttribute("stroke-dasharray", "10, 10");
    
    elements.appendChild(dashedLine);

    // Fix position of the text of genSet
    child.setAttribute('y', Number(child.getAttribute('y'))+9);
    if(Number(child.getAttribute('x'))-X > 0)
      child.setAttribute('x', Number(child.getAttribute('x'))-((Number(child.getAttribute('x'))-X)/1.6));
    else
      child.setAttribute('x', Number(child.getAttribute('x'))-((Number(child.getAttribute('x'))-X+155)));
  }
}

// Define the colors os the stereotypes
const colors = {
  'event': '#fcfcd4',
  'situation': '#fcfcd4',

  'category': '#d3d3fc',
  'mixin': '#d3d3fc',
  'phaseMixin': '#d3d3fc',
  'roleMixin': '#d3d3fc',
  'historicalRoleMixin': '#d3d3fc',

  'kind': '#ff99a3',
  'collective': '#ff99a3',

  'quantity': '#70d7ff',
  'quality': '#70d7ff',

  'mode': '#ff9966',
  'intrinsicMode': '#ff9966',
  'extrinsicMode': '#ff9966',

  'relator': '#99ff99',

  'type': '#d5d3d3',
  'powertype': '#d5d3d3',
  'datatype': '#d5d3d3',
  'enumeration': '#d5d3d3',

  'subkind': '#ffdadd',
  'phase': '#ffdadd',
  'role': '#ffdadd',
  'historicalRole': '#ffdadd',
}

// Set the colors of the stereotypes
// Upgrade: define the colors based on the generalizations and relations
const rectangles = document.querySelectorAll('body > div.content > svg > g > g > g:nth-child(2) > g > g > g > rect');
for(rect of rectangles){
    const name = rect.getAttribute('data-name');
    
    const init = name.indexOf('«');
    const end = name.indexOf('»');

    if (init !== -1 && end !== -1) {
        const stereotype = name.substring(init + 1, end);

        try{
          rect.style.fill = colors[stereotype];
        }
        catch(e){
          rect.style.fill = "#ffffff";
        }
    }
}

// Put the paths and texts in the end of svg elements, this sets them above other elements.
let num = elements.childElementCount;
let i = 0;
while(i<num) {
  if(elements.children[i].tagName !== 'g'){
    elements.appendChild(elements.removeChild(elements.children[i]));
    i--;
    num--;
  }
  i++;
}

// Import function
const vscode = acquireVsCodeApi();
const button = document.querySelector("body > div.download");
button.addEventListener("click", () => {
  body.style.cursor = "progress";
  button.style.cursor = "progress";
  
  const svg = document.querySelector("body > div.content > svg");
  
  (async () => {
    try {
      const dataUrl = await domtoimage.toPng(svg)
      
      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = document.title+'.png';
      downloadLink.click();
      
      setTimeout(() => {
        body.style.cursor = "move";
        button.style.cursor = "pointer";
      }, 2000);

      vscode.postMessage({ command: 'Success Download' });

      return;
    } catch (error) {
      console.error(error);
    }
    vscode.postMessage({ command: 'Fail Download' });
  })()
});