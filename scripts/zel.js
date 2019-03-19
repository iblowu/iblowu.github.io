// JavaScript source code
const showTopics = document.querySelector('#actions > button');
const grid = document.querySelector('.wrapper');
const buttons = document.querySelectorAll('.grid-item > button');
const paragraph = document.querySelector('#intro');
const history = document.querySelector('#history-network');

var continents;
var countries;
var languages;


const after_load=function(){
    showTopics.classList.add('fade-in');

    continents = JSON.parse(read_file("../data/continents.json"));
    countries = JSON.parse(read_file("../data/countries.json"));
    languages = JSON.parse(read_file("../data/languages.json"));
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

function read_file(filePath) {
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath, false);
    xmlhttp.send();
    if (xmlhttp.status == 200) {
        result = xmlhttp.responseText;
    }
    return result;
}

function window_to_show(e) {
    if (e.target.textContent === "History") {
        grid.setAttribute('style', 'display:none;');
        history.setAttribute('style', 'display:block');

        generate_network();

    }
}

buttons.forEach(function (button) {
    button.addEventListener('click', window_to_show);
});
showTopics.addEventListener('click', show_grid);



function generate_network() {
    console.log(continents, count);
    var nodes = new vis.DataSet();
    var edges = new vis.DataSet();

    Object.keys(continents).forEach(function (key) {
        nodes.add({
            id: `${key}`,
            label: `${continents[key].name}`,
            color: `${continents[key].color}`,
            shape: "ellipse",
            font:{color:"white",size:36}
        });
    });
    Object.keys(countries).forEach(function (keyCOU) {
        nodes.add({
            id: `${keyCOU}`,
            label: `${countries[keyCOU].name}`,
            shape: "box",
            font: { color: "white", size: 12.5 },

            continent: `${countries[keyCOU].continent}`
        });

        //can't break with foreach, using FOR OF instead
        let continentKeys = Object.keys(continents);

        for (keyCON of continentKeys) {
            if (countries[keyCOU].continent === keyCON) {
                edges.add({ from: `${keyCON}`, to: `${keyCOU}`, color: `${continents[keyCON].color}` });
                break;
            }
        };


        
        //Object.keys(continents).forEach(function (keyCON) {
        //    console.log(keyCON,countries[keyCOU].continent);
        //    if (countries[keyCOU].continent === keyCON) {
        //        edges.add({ from: `${keyCON}`, to: `${keyCOU}` });
        //    }
        //});


    });
    var data = {
        nodes: nodes,
        edges: edges
    };

    var options = {
        layout: {
            improvedLayout: false
        }
};

    // initialize your network!
    var network = new vis.Network(history, data, options);
}