// JavaScript source code
const showTopics = document.querySelector('#actions > button');
const grid = document.querySelector('.wrapper');
const buttons = document.querySelectorAll('.grid-item > button');
const paragraph = document.querySelector('#intro');
const history = document.querySelector('#history-network');


const after_load=function(){
    showTopics.classList.add('fade-in');
    var continents = read_file("../data/continents.json");
    var countries = read_file("../data/countries.json");
    var languages = read_file("../data/languages.json");
}

window.onload = after_load;

function show_grid(e) {

    let display = window.getComputedStyle(grid).display;

    if (display === "none") {
        document.getElementById("a1").play();
        document.getElementById("a1").volume = 0.05;
        grid.classList.add('swing-in-top-fwd');
        grid.setAttribute('style', 'display:grid;');
        history.setAttribute('style', 'display:none');
        paragraph.classList.add('slide-out-top');
    }
}

function window_to_show(e){
    if(e.target.textContent==="History")
    {
        grid.setAttribute('style', 'display:none;');
        history.setAttribute('style', 'display:block');
    }

}

buttons.forEach(function (button) {
    button.addEventListener('click', window_to_show);
})
showTopics.addEventListener('click', show_grid);

function read_file(filePath) {
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath);
    xmlhttp.send();
    if (xmlhttp.status==200) {
        result = xmlhttp.responseText;
    }
    return result;
}


console.log(countries);

var nodes = new vis.DataSet([
      { id: 1, label: 'Node 1' },
      { id: 2, label: 'Node 2' },
      { id: 3, label: 'Node 3' },
      { id: 4, label: 'Node 4' },
      { id: 5, label: 'Node 5' }
]);

// create an array with edges
var edges = new vis.DataSet([
    { from: 1, to: 3 },
    { from: 1, to: 2 },
    { from: 2, to: 4 },
    { from: 2, to: 5 }
]);

// create a network

// provide the data in the vis format
var data = {
    nodes: nodes,
    edges: edges
};
var options = {};

// initialize your network!
var network = new vis.Network(history, data, options);