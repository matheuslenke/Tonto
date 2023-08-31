export const setHTML = (nomnomlContent: string) => {
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
let containerCenterX = 0;
let containerCenterY = 0;
let centerX = 0;
let centerY = 0;
let initCenterX = content.getBoundingClientRect().left;
let initCenterY = content.getBoundingClientRect().top;

document.addEventListener('mousedown', (e) => {
  isDragging = true;
  body.classList.add('grabbing');
  
  containerCenterX = e.clientX;
  containerCenterY = e.clientY;
  centerX = content.getBoundingClientRect().left - initCenterX;
  centerY = content.getBoundingClientRect().top - initCenterY;
});

document.addEventListener('mouseup', (e) => {
  isDragging = false;
  body.classList.remove('grabbing');
});

document.addEventListener('mousemove', (e) => {
  if(!isDragging) return;

  const deltaX = e.clientX - containerCenterX + centerX;
  const deltaY = e.clientY - containerCenterY + centerY;

  content.style.transform = 'translate(' + deltaX + 'px, ' + deltaY + 'px)';
});

// ZOOM DIAGRAM
let zoom = 1;
body.addEventListener('mousewheel', (e) => {
  if(e.ctrlKey){
    
    // Calculate the new zoom level based on the mouse scroll
    scroll = zoom < 2? e.deltaY * 0.0005 : e.deltaY * 0.001;
    zoom = zoom - scroll;
    if(zoom <= 0.5) zoom = 0.5;
    
    // Set the new zoom level
    body.style.transform = 'scale(' + zoom + ')';
    
    // Prevent the default scroll behavior
    // e.preventDefault();
    initCenterX = content.getBoundingClientRect().left;
    initCenterY = content.getBoundingClientRect().top;
  }
});

// Sets background color of classes
// let background = document.querySelectorAll("body > div > svg > g > g > g:nth-child(2) > g > g > g:nth-child(1)");
// console.log(background);
// background.forEach(element => {
//   element.style.fill = "#ffffff";
// });

// ("body > div > svg > g > g > g:nth-child(2) > g > g > g")

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
// POSSIVEL ERRO: nao sei como lida com os nomes e estereotipos nas relações
const texts = document.getElementsByTagName("text");
for (const text of texts) {
    if(/«.*»/.test(text.textContent)){
        console.log(text);

        let stereotype = document.createElementNS("http://www.w3.org/2000/svg", 'tspan');
        let name = document.createElementNS("http://www.w3.org/2000/svg", 'tspan');
        [stereotype.textContent, name.textContent] = text.textContent.split(' ');
        
        const textBox = text.getBBox();
        console.log(textBox);

        stereotype.setAttribute('y', textBox.height/4);
        stereotype.setAttribute('x', text.getAttribute("x"));
        name.setAttribute('y', textBox.height/0.75);
        name.setAttribute('x', text.getAttribute("x"));
        
        text.textContent = '';

        text.appendChild(stereotype);
        text.appendChild(name);
    }
}

// const genSet = document.querySelector("body > div > svg > g > g > g:nth-child(2) > g");
// console.log(genSet);
`;

// codigo html/css para fazer a dashed line para o genSet.
// `<path stroke-dasharray="10,10" d="M73.0 115.0 L683.0 115.0"></path>`

const CSS = `
* {
    border: solid red 2px;
    margin: 0;
    padding: 0;
}

text, tspan{
    fill: black;
}

body {
    background-color: white;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: scale(1);
    transition: transform 0.3s ease; /* Transição suave para o efeito de zoom */
    cursor: grab;
}  

.grabbing {
    cursor: grabbing;
} 

.content {
    transform-origin: center center;
}
`;