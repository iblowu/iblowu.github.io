// JavaScript source code
const showtopics = document.querySelector('#actions > button');
const grid = document.querySelector('.wrapper');
const buttonarray = document.querySelectorAll('.grid-item > button');

console.log(buttonarray);

const fade_in=function(){
    showtopics.classList.add('fade-in');
}

window.onload = fade_in;

function show_grid(e){
    document.getElementById("a1").play();
    document.getElementById("a1").volume = 0.05;
    grid.classList.add('swing-in-top-fwd');
    grid.setAttribute('style', 'visibility:visible;');
}



showtopics.addEventListener('click', show_grid);