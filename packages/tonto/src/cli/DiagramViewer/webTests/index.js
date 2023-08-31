
const body = document.getElementsByTagName("body")[0];
const content = document.querySelector('.content');

let isDragging = false;
let mouseDownX = 0;
let mouseDownY = 0;
let centerX = 0;
let centerY = 0;
let initCenterX = content.getBoundingClientRect().left;
let initCenterY = content.getBoundingClientRect().top;

// IDEIA: modificar o content.getBoundingClientRect().left e content.getBoundingClientRect().top para fazer o movimento em vez de usar o style.transform
// body.addEventListener('mousedown', (e) => {
//   isDragging = true;
//   body.classList.add('grabbing');
  
//   mouseDownX = e.clientX;
//   mouseDownY = e.clientY;
//   console.log('MOUSEDOWN');
//   console.log('INIT: ', initCenterX, initCenterY);
//   centerX = content.getBoundingClientRect().left - initCenterX;
//   centerY = content.getBoundingClientRect().top - initCenterY;

//   console.log('INIT: ', initCenterX, initCenterY);
//   console.log('CENTER: ', centerX, centerY);
//   console.log('DIST: ', content.getBoundingClientRect().left, content.getBoundingClientRect().top);
// });

// body.addEventListener('mouseup', (e) => {
//   isDragging = false;
//   body.classList.remove('grabbing');
// });

// body.addEventListener('mousemove', (e) => {
//   if(!isDragging) return;

//   const deltaX = e.clientX - mouseDownX + centerX;
//   const deltaY = e.clientY - mouseDownY + centerY;

//   content.style.transform = 'translate(' + deltaX + 'px, ' + deltaY + 'px)';
// });

// ZOOM DIAGRAM
let zoom = 1;
body.addEventListener('mousewheel', (e) => {
  if(e.ctrlKey){
    
    // Calculate the new zoom level based on the mouse scroll
    scroll = zoom < 2? e.deltaY * 0.0005 : e.deltaY * 0.001;
    let newZoom = zoom - scroll;

    // Define the limits
    console.log('ANTES: ', zoom, newZoom);
    zoom = Math.min(Math.max(newZoom, 1), 2);
    console.log('DEPOIS: ', zoom, newZoom);
    
    // Set the new zoom level
    // content.style.transform = 'scale(' + zoom + ')';
    
    // Apply the new zoom level with a smooth transition
    content.style.transform = 'scale(' + zoom + ')';
    
    // Prevent the default scroll behavior
    if (newZoom > 1 && newZoom < 2){
      e.preventDefault();
    }
  }
});
    
    // Prevent the default scroll behavior
    // e.preventDefault();
//     initCenterX = content.getBoundingClientRect().left - (content.getBoundingClientRect().width - content.offsetWidth) / 2;
//     initCenterY = content.getBoundingClientRect().top - (content.getBoundingClientRect().height - content.offsetHeight) / 2;
//     centerX = content.getBoundingClientRect().left - initCenterX;
//     centerY = content.getBoundingClientRect().top - initCenterY;

//     console.log('MOUSEWHEEL');
//     console.log('INIT: ', initCenterX, initCenterY);
//     console.log('CENTER: ', centerX, centerY);
//     console.log('DIST: ', content.getBoundingClientRect().width, content.offsetWidth);
//     console.log('DIST: ', content.getBoundingClientRect().height, content.offsetHeight);
//   }
// });

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
        // console.log(text);

        let stereotype = document.createElementNS("http://www.w3.org/2000/svg", 'tspan');
        let name = document.createElementNS("http://www.w3.org/2000/svg", 'tspan');
        [stereotype.textContent, name.textContent] = text.textContent.split(' ');
        
        const textBox = text.getBBox();
        // console.log(textBox);

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