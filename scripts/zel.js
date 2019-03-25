const showTopicsButton = document.querySelector('#actions > button');
const grid = document.querySelector('.wrapper');
const buttons = document.querySelectorAll('.grid-item > button');
const paragraph = document.querySelector('#intro');
const historyContainer = document.querySelector('#history-container');
const history = document.querySelector('#history-network');

const queryBox = document.querySelector('#query-box');
const dropDown = document.getElementsByName("query-type")[0];
const checkBox = document.getElementsByName("hierarchy")[0];
const resetButton = document.getElementsByName("reset")[0];
const filterButton = document.getElementsByName("filter")[0];

const wiki = "https://en.wikipedia.org/wiki/";

var nodes = new vis.DataSet();
var edges = new vis.DataSet();
var data = {
    nodes: nodes,
    edges: edges
};
var options = {
    layout: {
        improvedLayout: false,
        hierarchical: {
            enabled: false,
            sortMethod: "directed"
        }
    },
    physics: {
        enabled: true,
        hierarchicalRepulsion: {
            nodeDistance:170
        }
    },
    groups: {
        continents: {
            shape: "ellipse",
            font: { color: "white", size: 36 }
        },
        countries: {
            shape: "box",
            font: { color: "white", size: 12.5 },
        }
    }
};
var network;
var filteredNetwork;
var networkGenerated = 0;

var countryKeys=[];
var continentKeys=[];

var continents;
var countries;
var languages;

paragraph.addEventListener('animationend', function (e) {
    paragraph.setAttribute('style', 'display:none');
});

const after_load=function(){
    showTopicsButton.classList.add('fade-in');

   /*continents = JSON.parse(read_file("../data/continents.json"));
    countries = JSON.parse(read_file("../data/countries.json")); 
    languages = JSON.parse(read_file("../data/languages.json"));*/
}

window.onload = after_load;

function show_grid(e) {

    let display = window.getComputedStyle(grid).display;

    if (display === "none") {
        /*document.getElementById("a1").play();
        document.getElementById("a1").volume = 0.05;*/
        grid.classList.add('swing-in-top-fwd');
        grid.setAttribute('style', 'display:grid;');
        historyContainer.setAttribute('style', 'display:none');
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
        historyContainer.setAttribute('style', 'display:block');
        generate_network(networkGenerated);
    }
}

function filter_based_on_radio(radioVal) {
    let filteredNodes=[];

    if (queryBox.value.length > 0) {
        switch (radioVal) {
            case "continent":
                let queryContinentList = queryBox.value.split(";");
                let childNodeIDs=[];
                filteredNodes.push(
                              nodes.get({
                                filter: function (node) {
                                    if (node.group === "continents")
                                        for (continent of queryContinentList) {
                                            if (node.label.toLowerCase() == continent || node.id == continent) {
                                                childNodeIDs.push(network.getConnectedNodes(node.id));
                                                return true;
                                            }
                                        }
                                    }
                              })
                );
               childNodeIDs=childNodeIDs.flat();
               filteredNodes.push(
                             nodes.get({
                                 filter: function (node) {
                                    if(node.group ==="countries")
                                        return childNodeIDs.includes(node.id);
                                }
                             })
               );
                filteredNodes = filteredNodes.flat();
                data.nodes = filteredNodes;
                filteredNetwork = new vis.Network(history, data, options);
                filteredNetwork.setOptions(hierarchical_display());
                break;
            case "country":
                let queryCountryList = queryBox.value.toLowerCase().split(";");
                let parentNodeIDs=[] ;
                filteredNodes.push(
                             nodes.get({
                                 filter: function (node) {
                                     
                                     if (node.group === "countries" && dropDown.value === "start") {
                                         for (country of queryCountryList) {
                                             if (node.label.toLowerCase().startsWith(country)) {
                                                 parentNodeIDs.push(network.getConnectedNodes(node.id));
                                                 return true;
                                             }
                                         }
                                     }
                                     else if (node.group === "countries" && dropDown.value === "anywhere") {
                                         for (country of queryCountryList) {
                                             if (node.label.toLowerCase().includes(country)) {
                                                 parentNodeIDs.push(network.getConnectedNodes(node.id));
                                                 return true;
                                             }
                                         }
                                     }
                                 }
                             })
                );
                parentNodeIDs=parentNodeIDs.flat();
                filteredNodes.push(
                             nodes.get({
                                 filter: function (node) {
                                     if (parentNodeIDs.includes(node.id)) {
                                         return true;
                                     }
                                 }
                             })
                );
                filteredNodes=filteredNodes.flat();
                data.nodes = filteredNodes;
                filteredNetwork = new vis.Network(history, data, options);
                filteredNetwork.setOptions(hierarchical_display());
                break;
            case "language":
                break;
        }
        filteredNetwork.on('doubleClick', function (properties) {
            let ids = properties.nodes;
            let clickedNodes = nodes.get(ids);
            window.open(wiki + clickedNodes[0].label, '_blank');
        });
    }
    else{
                network.setOptions(hierarchical_display());
        }
}

function hierarchical_display() {
    if (checkBox.checked)
        return {layout: {hierarchical: {enabled: true }  }}
    else
        return {layout: {hierarchical: {enabled: false }  }}
}

function reset_network(e) {
    data.nodes = nodes;
    network = new vis.Network(history, data, options);
}

function manipulate_network(e) {
    let radioButton = document.querySelector('input[name="query"]:checked');
    filter_based_on_radio(radioButton.value);

}

buttons.forEach(function (button) {
    button.addEventListener('click', window_to_show);
});

showTopicsButton.addEventListener('click', show_grid);
filterButton.addEventListener('click', manipulate_network);
resetButton.addEventListener('click', reset_network);

function generate_network(networkGeneratedParam) {
    if (!networkGeneratedParam) {
        countryKeys = Object.keys(countries);
        continentKeys = Object.keys(continents);

        for(keyCON of continentKeys) {
            nodes.add({
                id: `${keyCON}`,
                label: `${continents[keyCON].name}`,
                color: `${continents[keyCON].color}`,
                group: "continents"
            });
        };

        for (keyCOU of countryKeys){
            nodes.add({
                id: `${keyCOU}`,
                label: `${countries[keyCOU].name}`,
                continent: `${countries[keyCOU].continent}`,
                color: `${continents[countries[keyCOU].continent].color}`,
                group: "countries"
            });

            for (keyCON of continentKeys) {
                if (countries[keyCOU].continent === keyCON) {
                    edges.add({ from: `${keyCON}`, to: `${keyCOU}`, color: `${continents[keyCON].color}` });
                    break;
                }
            };
        };

        network = new vis.Network(history, data, options);

        network.on('doubleClick', function (properties) {
            let ids = properties.nodes;
            let clickedNodes = nodes.get(ids);
            window.open(wiki + clickedNodes[0].label, '_blank');
        });
        networkGenerated = 1;
    }
}

var continents = {
    "AF": {
        "name": "Africa",
        "color": "orange"
    },
    "AN": {
        "name": "Antarctica",
        "color": "#9C9C9C"
    },
    "AS": {
        "name": "Asia",
        "color": "#8A8A00"
    },
    "EU": {
        "name": "Europe",
        "color": "blue"
    },
    "NA": {
        "name": "North America",
        "color": "red"
    },
    "OC": {
        "name": "Oceania",
        "color": "teal"
    },
    "SA": {
        "name": "South America",
        "color": "green"
    }
}

var countries = {
    "AND": {
        "name": "Andorra",
        "native": "Andorra",
        "phone": "376",
        "continent": "EU",
        "capital": "Andorra la Vella",
        "currency": "EUR",
        "languages": [
          "ca"
        ]
    },
    "ARE": {
        "name": "United Arab Emirates",
        "native": "دولة الإمارات العربية المتحدة",
        "phone": "971",
        "continent": "AS",
        "capital": "Abu Dhabi",
        "currency": "AED",
        "languages": [
          "ar"
        ]
    },
    "AFG": {
        "name": "Afghanistan",
        "native": "افغانستان",
        "phone": "93",
        "continent": "AS",
        "capital": "Kabul",
        "currency": "AFN",
        "languages": [
          "ps",
          "uz",
          "tk"
        ]
    },
    "ATG": {
        "name": "Antigua and Barbuda",
        "native": "Antigua and Barbuda",
        "phone": "1268",
        "continent": "NA",
        "capital": "Saint John's",
        "currency": "XCD",
        "languages": [
          "en"
        ]
    },
    "AIA": {
        "name": "Anguilla",
        "native": "Anguilla",
        "phone": "1264",
        "continent": "NA",
        "capital": "The Valley",
        "currency": "XCD",
        "languages": [
          "en"
        ]
    },
    "ALB": {
        "name": "Albania",
        "native": "Shqipëria",
        "phone": "355",
        "continent": "EU",
        "capital": "Tirana",
        "currency": "ALL",
        "languages": [
          "sq"
        ]
    },
    "ARM": {
        "name": "Armenia",
        "native": "Հայաստան",
        "phone": "374",
        "continent": "AS",
        "capital": "Yerevan",
        "currency": "AMD",
        "languages": [
          "hy",
          "ru"
        ]
    },
    "AGO": {
        "name": "Angola",
        "native": "Angola",
        "phone": "244",
        "continent": "AF",
        "capital": "Luanda",
        "currency": "AOA",
        "languages": [
          "pt"
        ]
    },
    "ATA": {
        "name": "Antarctica",
        "native": "Antarctica",
        "phone": "672",
        "continent": "AN",
        "capital": "",
        "currency": "",
        "languages": []
    },
    "ARG": {
        "name": "Argentina",
        "native": "Argentina",
        "phone": "54",
        "continent": "SA",
        "capital": "Buenos Aires",
        "currency": "ARS",
        "languages": [
          "es",
          "gn"
        ]
    },
    "ASM": {
        "name": "American Samoa",
        "native": "American Samoa",
        "phone": "1684",
        "continent": "OC",
        "capital": "Pago Pago",
        "currency": "USD",
        "languages": [
          "en",
          "sm"
        ]
    },
    "AUT": {
        "name": "Austria",
        "native": "Österreich",
        "phone": "43",
        "continent": "EU",
        "capital": "Vienna",
        "currency": "EUR",
        "languages": [
          "de"
        ]
    },
    "AUS": {
        "name": "Australia",
        "native": "Australia",
        "phone": "61",
        "continent": "OC",
        "capital": "Canberra",
        "currency": "AUD",
        "languages": [
          "en"
        ]
    },
    "ABW": {
        "name": "Aruba",
        "native": "Aruba",
        "phone": "297",
        "continent": "NA",
        "capital": "Oranjestad",
        "currency": "AWG",
        "languages": [
          "nl",
          "pa"
        ]
    },
    "ALA": {
        "name": "Åland",
        "native": "Åland",
        "phone": "358",
        "continent": "EU",
        "capital": "Mariehamn",
        "currency": "EUR",
        "languages": [
          "sv"
        ]
    },
    "AZE": {
        "name": "Azerbaijan",
        "native": "Azərbaycan",
        "phone": "994",
        "continent": "AS",
        "capital": "Baku",
        "currency": "AZN",
        "languages": [
          "az"
        ]
    },
    "BIH": {
        "name": "Bosnia and Herzegovina",
        "native": "Bosna i Hercegovina",
        "phone": "387",
        "continent": "EU",
        "capital": "Sarajevo",
        "currency": "BAM",
        "languages": [
          "bs",
          "hr",
          "sr"
        ]
    },
    "BRB": {
        "name": "Barbados",
        "native": "Barbados",
        "phone": "1246",
        "continent": "NA",
        "capital": "Bridgetown",
        "currency": "BBD",
        "languages": [
          "en"
        ]
    },
    "BGD": {
        "name": "Bangladesh",
        "native": "Bangladesh",
        "phone": "880",
        "continent": "AS",
        "capital": "Dhaka",
        "currency": "BDT",
        "languages": [
          "bn"
        ]
    },
    "BEL": {
        "name": "Belgium",
        "native": "België",
        "phone": "32",
        "continent": "EU",
        "capital": "Brussels",
        "currency": "EUR",
        "languages": [
          "nl",
          "fr",
          "de"
        ]
    },
    "BFA": {
        "name": "Burkina Faso",
        "native": "Burkina Faso",
        "phone": "226",
        "continent": "AF",
        "capital": "Ouagadougou",
        "currency": "XOF",
        "languages": [
          "fr",
          "ff"
        ]
    },
    "BGR": {
        "name": "Bulgaria",
        "native": "България",
        "phone": "359",
        "continent": "EU",
        "capital": "Sofia",
        "currency": "BGN",
        "languages": [
          "bg"
        ]
    },
    "BHR": {
        "name": "Bahrain",
        "native": "‏البحرين",
        "phone": "973",
        "continent": "AS",
        "capital": "Manama",
        "currency": "BHD",
        "languages": [
          "ar"
        ]
    },
    "BDI": {
        "name": "Burundi",
        "native": "Burundi",
        "phone": "257",
        "continent": "AF",
        "capital": "Bujumbura",
        "currency": "BIF",
        "languages": [
          "fr",
          "rn"
        ]
    },
    "BEN": {
        "name": "Benin",
        "native": "Bénin",
        "phone": "229",
        "continent": "AF",
        "capital": "Porto-Novo",
        "currency": "XOF",
        "languages": [
          "fr"
        ]
    },
    "BLM": {
        "name": "Saint Barthélemy",
        "native": "Saint-Barthélemy",
        "phone": "590",
        "continent": "NA",
        "capital": "Gustavia",
        "currency": "EUR",
        "languages": [
          "fr"
        ]
    },
    "BMU": {
        "name": "Bermuda",
        "native": "Bermuda",
        "phone": "1441",
        "continent": "NA",
        "capital": "Hamilton",
        "currency": "BMD",
        "languages": [
          "en"
        ]
    },
    "BRN": {
        "name": "Brunei",
        "native": "Negara Brunei Darussalam",
        "phone": "673",
        "continent": "AS",
        "capital": "Bandar Seri Begawan",
        "currency": "BND",
        "languages": [
          "ms"
        ]
    },
    "BOL": {
        "name": "Bolivia",
        "native": "Bolivia",
        "phone": "591",
        "continent": "SA",
        "capital": "Sucre",
        "currency": "BOB,BOV",
        "languages": [
          "es",
          "ay",
          "qu"
        ]
    },
    "BES": {
        "name": "Bonaire",
        "native": "Bonaire",
        "phone": "5997",
        "continent": "NA",
        "capital": "Kralendijk",
        "currency": "USD",
        "languages": [
          "nl"
        ]
    },
    "BRA": {
        "name": "Brazil",
        "native": "Brasil",
        "phone": "55",
        "continent": "SA",
        "capital": "Brasília",
        "currency": "BRL",
        "languages": [
          "pt"
        ]
    },
    "BHS": {
        "name": "Bahamas",
        "native": "Bahamas",
        "phone": "1242",
        "continent": "NA",
        "capital": "Nassau",
        "currency": "BSD",
        "languages": [
          "en"
        ]
    },
    "BTN": {
        "name": "Bhutan",
        "native": "ʼbrug-yul",
        "phone": "975",
        "continent": "AS",
        "capital": "Thimphu",
        "currency": "BTN,INR",
        "languages": [
          "dz"
        ]
    },
    "BVT": {
        "name": "Bouvet Island",
        "native": "Bouvetøya",
        "phone": "47",
        "continent": "AN",
        "capital": "",
        "currency": "NOK",
        "languages": [
          "no",
          "nb",
          "nn"
        ]
    },
    "BWA": {
        "name": "Botswana",
        "native": "Botswana",
        "phone": "267",
        "continent": "AF",
        "capital": "Gaborone",
        "currency": "BWP",
        "languages": [
          "en",
          "tn"
        ]
    },
    "BLR": {
        "name": "Belarus",
        "native": "Белару́сь",
        "phone": "375",
        "continent": "EU",
        "capital": "Minsk",
        "currency": "BYR",
        "languages": [
          "be",
          "ru"
        ]
    },
    "BLZ": {
        "name": "Belize",
        "native": "Belize",
        "phone": "501",
        "continent": "NA",
        "capital": "Belmopan",
        "currency": "BZD",
        "languages": [
          "en",
          "es"
        ]
    },
    "CAN": {
        "name": "Canada",
        "native": "Canada",
        "phone": "1",
        "continent": "NA",
        "capital": "Ottawa",
        "currency": "CAD",
        "languages": [
          "en",
          "fr"
        ]
    },
    "CCK": {
        "name": "Cocos [Keeling] Islands",
        "native": "Cocos (Keeling) Islands",
        "phone": "61",
        "continent": "AS",
        "capital": "West Island",
        "currency": "AUD",
        "languages": [
          "en"
        ]
    },
    "COD": {
        "name": "Democratic Republic of the Congo",
        "native": "République démocratique du Congo",
        "phone": "243",
        "continent": "AF",
        "capital": "Kinshasa",
        "currency": "CDF",
        "languages": [
          "fr",
          "ln",
          "kg",
          "sw",
          "lu"
        ]
    },
    "CAF": {
        "name": "Central African Republic",
        "native": "Ködörösêse tî Bêafrîka",
        "phone": "236",
        "continent": "AF",
        "capital": "Bangui",
        "currency": "XAF",
        "languages": [
          "fr",
          "sg"
        ]
    },
    "CG": {
        "name": "Republic of the Congo",
        "native": "République du Congo",
        "phone": "242",
        "continent": "AF",
        "capital": "Brazzaville",
        "currency": "XAF",
        "languages": [
          "fr",
          "ln"
        ]
    },
    "CHE": {
        "name": "Switzerland",
        "native": "Schweiz",
        "phone": "41",
        "continent": "EU",
        "capital": "Bern",
        "currency": "CHE,CHF,CHW",
        "languages": [
          "de",
          "fr",
          "it"
        ]
    },
    "CIV": {
        "name": "Ivory Coast",
        "native": "Côte d'Ivoire",
        "phone": "225",
        "continent": "AF",
        "capital": "Yamoussoukro",
        "currency": "XOF",
        "languages": [
          "fr"
        ]
    },
    "COK": {
        "name": "Cook Islands",
        "native": "Cook Islands",
        "phone": "682",
        "continent": "OC",
        "capital": "Avarua",
        "currency": "NZD",
        "languages": [
          "en"
        ]
    },
    "CHL": {
        "name": "Chile",
        "native": "Chile",
        "phone": "56",
        "continent": "SA",
        "capital": "Santiago",
        "currency": "CLF,CLP",
        "languages": [
          "es"
        ]
    },
    "CMR": {
        "name": "Cameroon",
        "native": "Cameroon",
        "phone": "237",
        "continent": "AF",
        "capital": "Yaoundé",
        "currency": "XAF",
        "languages": [
          "en",
          "fr"
        ]
    },
    "CHN": {
        "name": "China",
        "native": "中国",
        "phone": "86",
        "continent": "AS",
        "capital": "Beijing",
        "currency": "CNY",
        "languages": [
          "zh"
        ]
    },
    "COL": {
        "name": "Colombia",
        "native": "Colombia",
        "phone": "57",
        "continent": "SA",
        "capital": "Bogotá",
        "currency": "COP",
        "languages": [
          "es"
        ]
    },
    "CRI": {
        "name": "Costa Rica",
        "native": "Costa Rica",
        "phone": "506",
        "continent": "NA",
        "capital": "San José",
        "currency": "CRC",
        "languages": [
          "es"
        ]
    },
    "CUB": {
        "name": "Cuba",
        "native": "Cuba",
        "phone": "53",
        "continent": "NA",
        "capital": "Havana",
        "currency": "CUC,CUP",
        "languages": [
          "es"
        ]
    },
    "CPV": {
        "name": "Cape Verde",
        "native": "Cabo Verde",
        "phone": "238",
        "continent": "AF",
        "capital": "Praia",
        "currency": "CVE",
        "languages": [
          "pt"
        ]
    },
    "CUW": {
        "name": "Curacao",
        "native": "Curaçao",
        "phone": "5999",
        "continent": "NA",
        "capital": "Willemstad",
        "currency": "ANG",
        "languages": [
          "nl",
          "pa",
          "en"
        ]
    },
    "CXR": {
        "name": "Christmas Island",
        "native": "Christmas Island",
        "phone": "61",
        "continent": "AS",
        "capital": "Flying Fish Cove",
        "currency": "AUD",
        "languages": [
          "en"
        ]
    },
    "CYP": {
        "name": "Cyprus",
        "native": "Κύπρος",
        "phone": "357",
        "continent": "EU",
        "capital": "Nicosia",
        "currency": "EUR",
        "languages": [
          "el",
          "tr",
          "hy"
        ]
    },
    "CZE": {
        "name": "Czech Republic",
        "native": "Česká republika",
        "phone": "420",
        "continent": "EU",
        "capital": "Prague",
        "currency": "CZK",
        "languages": [
          "cs",
          "sk"
        ]
    },
    "DEU": {
        "name": "Germany",
        "native": "Deutschland",
        "phone": "49",
        "continent": "EU",
        "capital": "Berlin",
        "currency": "EUR",
        "languages": [
          "de"
        ]
    },
    "DJI": {
        "name": "Djibouti",
        "native": "Djibouti",
        "phone": "253",
        "continent": "AF",
        "capital": "Djibouti",
        "currency": "DJF",
        "languages": [
          "fr",
          "ar"
        ]
    },
    "DNK": {
        "name": "Denmark",
        "native": "Danmark",
        "phone": "45",
        "continent": "EU",
        "capital": "Copenhagen",
        "currency": "DKK",
        "languages": [
          "da"
        ]
    },
    "DMA": {
        "name": "Dominica",
        "native": "Dominica",
        "phone": "1767",
        "continent": "NA",
        "capital": "Roseau",
        "currency": "XCD",
        "languages": [
          "en"
        ]
    },
    "DOM": {
        "name": "Dominican Republic",
        "native": "República Dominicana",
        "phone": "1809,1829,1849",
        "continent": "NA",
        "capital": "Santo Domingo",
        "currency": "DOP",
        "languages": [
          "es"
        ]
    },
    "DZA": {
        "name": "Algeria",
        "native": "الجزائر",
        "phone": "213",
        "continent": "AF",
        "capital": "Algiers",
        "currency": "DZD",
        "languages": [
          "ar"
        ]
    },
    "ECU": {
        "name": "Ecuador",
        "native": "Ecuador",
        "phone": "593",
        "continent": "SA",
        "capital": "Quito",
        "currency": "USD",
        "languages": [
          "es"
        ]
    },
    "EST": {
        "name": "Estonia",
        "native": "Eesti",
        "phone": "372",
        "continent": "EU",
        "capital": "Tallinn",
        "currency": "EUR",
        "languages": [
          "et"
        ]
    },
    "EGY": {
        "name": "Egypt",
        "native": "مصر‎",
        "phone": "20",
        "continent": "AF",
        "capital": "Cairo",
        "currency": "EGP",
        "languages": [
          "ar"
        ]
    },
    "ESH": {
        "name": "Western Sahara",
        "native": "الصحراء الغربية",
        "phone": "212",
        "continent": "AF",
        "capital": "El Aaiún",
        "currency": "MAD,DZD,MRU",
        "languages": [
          "es"
        ]
    },
    "ERI": {
        "name": "Eritrea",
        "native": "ኤርትራ",
        "phone": "291",
        "continent": "AF",
        "capital": "Asmara",
        "currency": "ERN",
        "languages": [
          "ti",
          "ar",
          "en"
        ]
    },
    "ESP": {
        "name": "Spain",
        "native": "España",
        "phone": "34",
        "continent": "EU",
        "capital": "Madrid",
        "currency": "EUR",
        "languages": [
          "es",
          "eu",
          "ca",
          "gl",
          "oc"
        ]
    },
    "ETH": {
        "name": "Ethiopia",
        "native": "ኢትዮጵያ",
        "phone": "251",
        "continent": "AF",
        "capital": "Addis Ababa",
        "currency": "ETB",
        "languages": [
          "am"
        ]
    },
    "FIN": {
        "name": "Finland",
        "native": "Suomi",
        "phone": "358",
        "continent": "EU",
        "capital": "Helsinki",
        "currency": "EUR",
        "languages": [
          "fi",
          "sv"
        ]
    },
    "FJI": {
        "name": "Fiji",
        "native": "Fiji",
        "phone": "679",
        "continent": "OC",
        "capital": "Suva",
        "currency": "FJD",
        "languages": [
          "en",
          "fj",
          "hi",
          "ur"
        ]
    },
    "FLK": {
        "name": "Falkland Islands",
        "native": "Falkland Islands",
        "phone": "500",
        "continent": "SA",
        "capital": "Stanley",
        "currency": "FKP",
        "languages": [
          "en"
        ]
    },
    "FSM": {
        "name": "Micronesia",
        "native": "Micronesia",
        "phone": "691",
        "continent": "OC",
        "capital": "Palikir",
        "currency": "USD",
        "languages": [
          "en"
        ]
    },
    "FRO": {
        "name": "Faroe Islands",
        "native": "Føroyar",
        "phone": "298",
        "continent": "EU",
        "capital": "Tórshavn",
        "currency": "DKK",
        "languages": [
          "fo"
        ]
    },
    "FRA": {
        "name": "France",
        "native": "France",
        "phone": "33",
        "continent": "EU",
        "capital": "Paris",
        "currency": "EUR",
        "languages": [
          "fr"
        ]
    },
    "GAB": {
        "name": "Gabon",
        "native": "Gabon",
        "phone": "241",
        "continent": "AF",
        "capital": "Libreville",
        "currency": "XAF",
        "languages": [
          "fr"
        ]
    },
    "GBR": {
        "name": "United Kingdom",
        "native": "United Kingdom",
        "phone": "44",
        "continent": "EU",
        "capital": "London",
        "currency": "GBP",
        "languages": [
          "en"
        ]
    },
    "GRD": {
        "name": "Grenada",
        "native": "Grenada",
        "phone": "1473",
        "continent": "NA",
        "capital": "St. George's",
        "currency": "XCD",
        "languages": [
          "en"
        ]
    },
    "GEO": {
        "name": "Georgia",
        "native": "საქართველო",
        "phone": "995",
        "continent": "AS",
        "capital": "Tbilisi",
        "currency": "GEL",
        "languages": [
          "ka"
        ]
    },
    "GUF": {
        "name": "French Guiana",
        "native": "Guyane française",
        "phone": "594",
        "continent": "SA",
        "capital": "Cayenne",
        "currency": "EUR",
        "languages": [
          "fr"
        ]
    },
    "GGY": {
        "name": "Guernsey",
        "native": "Guernsey",
        "phone": "44",
        "continent": "EU",
        "capital": "St. Peter Port",
        "currency": "GBP",
        "languages": [
          "en",
          "fr"
        ]
    },
    "GHA": {
        "name": "Ghana",
        "native": "Ghana",
        "phone": "233",
        "continent": "AF",
        "capital": "Accra",
        "currency": "GHS",
        "languages": [
          "en"
        ]
    },
    "GIB": {
        "name": "Gibraltar",
        "native": "Gibraltar",
        "phone": "350",
        "continent": "EU",
        "capital": "Gibraltar",
        "currency": "GIP",
        "languages": [
          "en"
        ]
    },
    "GRL": {
        "name": "Greenland",
        "native": "Kalaallit Nunaat",
        "phone": "299",
        "continent": "NA",
        "capital": "Nuuk",
        "currency": "DKK",
        "languages": [
          "kl"
        ]
    },
    "GMB": {
        "name": "Gambia",
        "native": "Gambia",
        "phone": "220",
        "continent": "AF",
        "capital": "Banjul",
        "currency": "GMD",
        "languages": [
          "en"
        ]
    },
    "GNQ": {
        "name": "Guinea",
        "native": "Guinée",
        "phone": "224",
        "continent": "AF",
        "capital": "Conakry",
        "currency": "GNF",
        "languages": [
          "fr",
          "ff"
        ]
    },
    "GLP": {
        "name": "Guadeloupe",
        "native": "Guadeloupe",
        "phone": "590",
        "continent": "NA",
        "capital": "Basse-Terre",
        "currency": "EUR",
        "languages": [
          "fr"
        ]
    },
    "GNQ": {
        "name": "Equatorial Guinea",
        "native": "Guinea Ecuatorial",
        "phone": "240",
        "continent": "AF",
        "capital": "Malabo",
        "currency": "XAF",
        "languages": [
          "es",
          "fr"
        ]
    },
    "GRC": {
        "name": "Greece",
        "native": "Ελλάδα",
        "phone": "30",
        "continent": "EU",
        "capital": "Athens",
        "currency": "EUR",
        "languages": [
          "el"
        ]
    },
    "SGS": {
        "name": "South Georgia and the South Sandwich Islands",
        "native": "South Georgia",
        "phone": "500",
        "continent": "AN",
        "capital": "King Edward Point",
        "currency": "GBP",
        "languages": [
          "en"
        ]
    },
    "GTM": {
        "name": "Guatemala",
        "native": "Guatemala",
        "phone": "502",
        "continent": "NA",
        "capital": "Guatemala City",
        "currency": "GTQ",
        "languages": [
          "es"
        ]
    },
    "GUM": {
        "name": "Guam",
        "native": "Guam",
        "phone": "1671",
        "continent": "OC",
        "capital": "Hagåtña",
        "currency": "USD",
        "languages": [
          "en",
          "ch",
          "es"
        ]
    },
    "GNB": {
        "name": "Guinea-Bissau",
        "native": "Guiné-Bissau",
        "phone": "245",
        "continent": "AF",
        "capital": "Bissau",
        "currency": "XOF",
        "languages": [
          "pt"
        ]
    },
    "GUY": {
        "name": "Guyana",
        "native": "Guyana",
        "phone": "592",
        "continent": "SA",
        "capital": "Georgetown",
        "currency": "GYD",
        "languages": [
          "en"
        ]
    },
    "HKG": {
        "name": "Hong Kong",
        "native": "香港",
        "phone": "852",
        "continent": "AS",
        "capital": "City of Victoria",
        "currency": "HKD",
        "languages": [
          "zh",
          "en"
        ]
    },
    "HMD": {
        "name": "Heard Island and McDonald Islands",
        "native": "Heard Island and McDonald Islands",
        "phone": "61",
        "continent": "AN",
        "capital": "",
        "currency": "AUD",
        "languages": [
          "en"
        ]
    },
    "HND": {
        "name": "Honduras",
        "native": "Honduras",
        "phone": "504",
        "continent": "NA",
        "capital": "Tegucigalpa",
        "currency": "HNL",
        "languages": [
          "es"
        ]
    },
    "HRV": {
        "name": "Croatia",
        "native": "Hrvatska",
        "phone": "385",
        "continent": "EU",
        "capital": "Zagreb",
        "currency": "HRK",
        "languages": [
          "hr"
        ]
    },
    "HTI": {
        "name": "Haiti",
        "native": "Haïti",
        "phone": "509",
        "continent": "NA",
        "capital": "Port-au-Prince",
        "currency": "HTG,USD",
        "languages": [
          "fr",
          "ht"
        ]
    },
    "HUN": {
        "name": "Hungary",
        "native": "Magyarország",
        "phone": "36",
        "continent": "EU",
        "capital": "Budapest",
        "currency": "HUF",
        "languages": [
          "hu"
        ]
    },
    "IDN": {
        "name": "Indonesia",
        "native": "Indonesia",
        "phone": "62",
        "continent": "AS",
        "capital": "Jakarta",
        "currency": "IDR",
        "languages": [
          "id"
        ]
    },
    "IRL": {
        "name": "Ireland",
        "native": "Éire",
        "phone": "353",
        "continent": "EU",
        "capital": "Dublin",
        "currency": "EUR",
        "languages": [
          "ga",
          "en"
        ]
    },
    "ISR": {
        "name": "Israel",
        "native": "יִשְׂרָאֵל",
        "phone": "972",
        "continent": "AS",
        "capital": "Jerusalem",
        "currency": "ILS",
        "languages": [
          "he",
          "ar"
        ]
    },
    "IMN": {
        "name": "Isle of Man",
        "native": "Isle of Man",
        "phone": "44",
        "continent": "EU",
        "capital": "Douglas",
        "currency": "GBP",
        "languages": [
          "en",
          "gv"
        ]
    },
    "IND": {
        "name": "India",
        "native": "भारत",
        "phone": "91",
        "continent": "AS",
        "capital": "New Delhi",
        "currency": "INR",
        "languages": [
          "hi",
          "en"
        ]
    },
    "IOT": {
        "name": "British Indian Ocean Territory",
        "native": "British Indian Ocean Territory",
        "phone": "246",
        "continent": "AS",
        "capital": "Diego Garcia",
        "currency": "USD",
        "languages": [
          "en"
        ]
    },
    "IRQ": {
        "name": "Iraq",
        "native": "العراق",
        "phone": "964",
        "continent": "AS",
        "capital": "Baghdad",
        "currency": "IQD",
        "languages": [
          "ar",
          "ku"
        ]
    },
    "IRN": {
        "name": "Iran",
        "native": "ایران",
        "phone": "98",
        "continent": "AS",
        "capital": "Tehran",
        "currency": "IRR",
        "languages": [
          "fa"
        ]
    },
    "ISL": {
        "name": "Iceland",
        "native": "Ísland",
        "phone": "354",
        "continent": "EU",
        "capital": "Reykjavik",
        "currency": "ISK",
        "languages": [
          "is"
        ]
    },
    "ITA": {
        "name": "Italy",
        "native": "Italia",
        "phone": "39",
        "continent": "EU",
        "capital": "Rome",
        "currency": "EUR",
        "languages": [
          "it"
        ]
    },
    "JEY": {
        "name": "Jersey",
        "native": "Jersey",
        "phone": "44",
        "continent": "EU",
        "capital": "Saint Helier",
        "currency": "GBP",
        "languages": [
          "en",
          "fr"
        ]
    },
    "JAM": {
        "name": "Jamaica",
        "native": "Jamaica",
        "phone": "1876",
        "continent": "NA",
        "capital": "Kingston",
        "currency": "JMD",
        "languages": [
          "en"
        ]
    },
    "JOR": {
        "name": "Jordan",
        "native": "الأردن",
        "phone": "962",
        "continent": "AS",
        "capital": "Amman",
        "currency": "JOD",
        "languages": [
          "ar"
        ]
    },
    "JPN": {
        "name": "Japan",
        "native": "日本",
        "phone": "81",
        "continent": "AS",
        "capital": "Tokyo",
        "currency": "JPY",
        "languages": [
          "ja"
        ]
    },
    "KEN": {
        "name": "Kenya",
        "native": "Kenya",
        "phone": "254",
        "continent": "AF",
        "capital": "Nairobi",
        "currency": "KES",
        "languages": [
          "en",
          "sw"
        ]
    },
    "KGZ": {
        "name": "Kyrgyzstan",
        "native": "Кыргызстан",
        "phone": "996",
        "continent": "AS",
        "capital": "Bishkek",
        "currency": "KGS",
        "languages": [
          "ky",
          "ru"
        ]
    },
    "KHM": {
        "name": "Cambodia",
        "native": "Kâmpŭchéa",
        "phone": "855",
        "continent": "AS",
        "capital": "Phnom Penh",
        "currency": "KHR",
        "languages": [
          "km"
        ]
    },
    "KIR": {
        "name": "Kiribati",
        "native": "Kiribati",
        "phone": "686",
        "continent": "OC",
        "capital": "South Tarawa",
        "currency": "AUD",
        "languages": [
          "en"
        ]
    },
    "COM": {
        "name": "Comoros",
        "native": "Komori",
        "phone": "269",
        "continent": "AF",
        "capital": "Moroni",
        "currency": "KMF",
        "languages": [
          "ar",
          "fr"
        ]
    },
    "KNA": {
        "name": "Saint Kitts and Nevis",
        "native": "Saint Kitts and Nevis",
        "phone": "1869",
        "continent": "NA",
        "capital": "Basseterre",
        "currency": "XCD",
        "languages": [
          "en"
        ]
    },
    "PRK": {
        "name": "North Korea",
        "native": "북한",
        "phone": "850",
        "continent": "AS",
        "capital": "Pyongyang",
        "currency": "KPW",
        "languages": [
          "ko"
        ]
    },
    "KOR": {
        "name": "South Korea",
        "native": "대한민국",
        "phone": "82",
        "continent": "AS",
        "capital": "Seoul",
        "currency": "KRW",
        "languages": [
          "ko"
        ]
    },
    "KWT": {
        "name": "Kuwait",
        "native": "الكويت",
        "phone": "965",
        "continent": "AS",
        "capital": "Kuwait City",
        "currency": "KWD",
        "languages": [
          "ar"
        ]
    },
    "CYM": {
        "name": "Cayman Islands",
        "native": "Cayman Islands",
        "phone": "1345",
        "continent": "NA",
        "capital": "George Town",
        "currency": "KYD",
        "languages": [
          "en"
        ]
    },
    "KAZ": {
        "name": "Kazakhstan",
        "native": "Қазақстан",
        "phone": "76,77",
        "continent": "AS",
        "capital": "Astana",
        "currency": "KZT",
        "languages": [
          "kk",
          "ru"
        ]
    },
    "LAO": {
        "name": "Laos",
        "native": "ສປປລາວ",
        "phone": "856",
        "continent": "AS",
        "capital": "Vientiane",
        "currency": "LAK",
        "languages": [
          "lo"
        ]
    },
    "LBN": {
        "name": "Lebanon",
        "native": "لبنان",
        "phone": "961",
        "continent": "AS",
        "capital": "Beirut",
        "currency": "LBP",
        "languages": [
          "ar",
          "fr"
        ]
    },
    "LCA": {
        "name": "Saint Lucia",
        "native": "Saint Lucia",
        "phone": "1758",
        "continent": "NA",
        "capital": "Castries",
        "currency": "XCD",
        "languages": [
          "en"
        ]
    },
    "LIE": {
        "name": "Liechtenstein",
        "native": "Liechtenstein",
        "phone": "423",
        "continent": "EU",
        "capital": "Vaduz",
        "currency": "CHF",
        "languages": [
          "de"
        ]
    },
    "LKA": {
        "name": "Sri Lanka",
        "native": "śrī laṃkāva",
        "phone": "94",
        "continent": "AS",
        "capital": "Colombo",
        "currency": "LKR",
        "languages": [
          "si",
          "ta"
        ]
    },
    "LBR": {
        "name": "Liberia",
        "native": "Liberia",
        "phone": "231",
        "continent": "AF",
        "capital": "Monrovia",
        "currency": "LRD",
        "languages": [
          "en"
        ]
    },
    "LSO": {
        "name": "Lesotho",
        "native": "Lesotho",
        "phone": "266",
        "continent": "AF",
        "capital": "Maseru",
        "currency": "LSL,ZAR",
        "languages": [
          "en",
          "st"
        ]
    },
    "LTU": {
        "name": "Lithuania",
        "native": "Lietuva",
        "phone": "370",
        "continent": "EU",
        "capital": "Vilnius",
        "currency": "EUR",
        "languages": [
          "lt"
        ]
    },
    "LUX": {
        "name": "Luxembourg",
        "native": "Luxembourg",
        "phone": "352",
        "continent": "EU",
        "capital": "Luxembourg",
        "currency": "EUR",
        "languages": [
          "fr",
          "de",
          "lb"
        ]
    },
    "LVA": {
        "name": "Latvia",
        "native": "Latvija",
        "phone": "371",
        "continent": "EU",
        "capital": "Riga",
        "currency": "EUR",
        "languages": [
          "lv"
        ]
    },
    "LBY": {
        "name": "Libya",
        "native": "‏ليبيا",
        "phone": "218",
        "continent": "AF",
        "capital": "Tripoli",
        "currency": "LYD",
        "languages": [
          "ar"
        ]
    },
    "MAR": {
        "name": "Morocco",
        "native": "المغرب",
        "phone": "212",
        "continent": "AF",
        "capital": "Rabat",
        "currency": "MAD",
        "languages": [
          "ar"
        ]
    },
    "MCO": {
        "name": "Monaco",
        "native": "Monaco",
        "phone": "377",
        "continent": "EU",
        "capital": "Monaco",
        "currency": "EUR",
        "languages": [
          "fr"
        ]
    },
    "MDA": {
        "name": "Moldova",
        "native": "Moldova",
        "phone": "373",
        "continent": "EU",
        "capital": "Chișinău",
        "currency": "MDL",
        "languages": [
          "ro"
        ]
    },
    "MNE": {
        "name": "Montenegro",
        "native": "Црна Гора",
        "phone": "382",
        "continent": "EU",
        "capital": "Podgorica",
        "currency": "EUR",
        "languages": [
          "sr",
          "bs",
          "sq",
          "hr"
        ]
    },
    "MAF": {
        "name": "Saint Martin",
        "native": "Saint-Martin",
        "phone": "590",
        "continent": "NA",
        "capital": "Marigot",
        "currency": "EUR",
        "languages": [
          "en",
          "fr",
          "nl"
        ]
    },
    "MDG": {
        "name": "Madagascar",
        "native": "Madagasikara",
        "phone": "261",
        "continent": "AF",
        "capital": "Antananarivo",
        "currency": "MGA",
        "languages": [
          "fr",
          "mg"
        ]
    },
    "MHL": {
        "name": "Marshall Islands",
        "native": "M̧ajeļ",
        "phone": "692",
        "continent": "OC",
        "capital": "Majuro",
        "currency": "USD",
        "languages": [
          "en",
          "mh"
        ]
    },
    "MKD": {
        "name": "Macedonia",
        "native": "Македонија",
        "phone": "389",
        "continent": "EU",
        "capital": "Skopje",
        "currency": "MKD",
        "languages": [
          "mk"
        ]
    },
    "MLI": {
        "name": "Mali",
        "native": "Mali",
        "phone": "223",
        "continent": "AF",
        "capital": "Bamako",
        "currency": "XOF",
        "languages": [
          "fr"
        ]
    },
    "MMR": {
        "name": "Myanmar [Burma]",
        "native": "မြန်မာ",
        "phone": "95",
        "continent": "AS",
        "capital": "Naypyidaw",
        "currency": "MMK",
        "languages": [
          "my"
        ]
    },
    "MNG": {
        "name": "Mongolia",
        "native": "Монгол улс",
        "phone": "976",
        "continent": "AS",
        "capital": "Ulan Bator",
        "currency": "MNT",
        "languages": [
          "mn"
        ]
    },
    "MAC": {
        "name": "Macao",
        "native": "澳門",
        "phone": "853",
        "continent": "AS",
        "capital": "",
        "currency": "MOP",
        "languages": [
          "zh",
          "pt"
        ]
    },
    "MNP": {
        "name": "Northern Mariana Islands",
        "native": "Northern Mariana Islands",
        "phone": "1670",
        "continent": "OC",
        "capital": "Saipan",
        "currency": "USD",
        "languages": [
          "en",
          "ch"
        ]
    },
    "MTQ": {
        "name": "Martinique",
        "native": "Martinique",
        "phone": "596",
        "continent": "NA",
        "capital": "Fort-de-France",
        "currency": "EUR",
        "languages": [
          "fr"
        ]
    },
    "MRT": {
        "name": "Mauritania",
        "native": "موريتانيا",
        "phone": "222",
        "continent": "AF",
        "capital": "Nouakchott",
        "currency": "MRU",
        "languages": [
          "ar"
        ]
    },
    "MSR": {
        "name": "Montserrat",
        "native": "Montserrat",
        "phone": "1664",
        "continent": "NA",
        "capital": "Plymouth",
        "currency": "XCD",
        "languages": [
          "en"
        ]
    },
    "MLT": {
        "name": "Malta",
        "native": "Malta",
        "phone": "356",
        "continent": "EU",
        "capital": "Valletta",
        "currency": "EUR",
        "languages": [
          "mt",
          "en"
        ]
    },
    "MUS": {
        "name": "Mauritius",
        "native": "Maurice",
        "phone": "230",
        "continent": "AF",
        "capital": "Port Louis",
        "currency": "MUR",
        "languages": [
          "en"
        ]
    },
    "MDV": {
        "name": "Maldives",
        "native": "Maldives",
        "phone": "960",
        "continent": "AS",
        "capital": "Malé",
        "currency": "MVR",
        "languages": [
          "dv"
        ]
    },
    "MWI": {
        "name": "Malawi",
        "native": "Malawi",
        "phone": "265",
        "continent": "AF",
        "capital": "Lilongwe",
        "currency": "MWK",
        "languages": [
          "en",
          "ny"
        ]
    },
    "MEX": {
        "name": "Mexico",
        "native": "México",
        "phone": "52",
        "continent": "NA",
        "capital": "Mexico City",
        "currency": "MXN",
        "languages": [
          "es"
        ]
    },
    "MYS": {
        "name": "Malaysia",
        "native": "Malaysia",
        "phone": "60",
        "continent": "AS",
        "capital": "Kuala Lumpur",
        "currency": "MYR",
        "languages": [
          "ms"
        ]
    },
    "MOZ": {
        "name": "Mozambique",
        "native": "Moçambique",
        "phone": "258",
        "continent": "AF",
        "capital": "Maputo",
        "currency": "MZN",
        "languages": [
          "pt"
        ]
    },
    "NAM": {
        "name": "Namibia",
        "native": "Namibia",
        "phone": "264",
        "continent": "AF",
        "capital": "Windhoek",
        "currency": "NAD,ZAR",
        "languages": [
          "en",
          "af"
        ]
    },
    "NCL": {
        "name": "New Caledonia",
        "native": "Nouvelle-Calédonie",
        "phone": "687",
        "continent": "OC",
        "capital": "Nouméa",
        "currency": "XPF",
        "languages": [
          "fr"
        ]
    },
    "NER": {
        "name": "Niger",
        "native": "Niger",
        "phone": "227",
        "continent": "AF",
        "capital": "Niamey",
        "currency": "XOF",
        "languages": [
          "fr"
        ]
    },
    "NFK": {
        "name": "Norfolk Island",
        "native": "Norfolk Island",
        "phone": "672",
        "continent": "OC",
        "capital": "Kingston",
        "currency": "AUD",
        "languages": [
          "en"
        ]
    },
    "NGA": {
        "name": "Nigeria",
        "native": "Nigeria",
        "phone": "234",
        "continent": "AF",
        "capital": "Abuja",
        "currency": "NGN",
        "languages": [
          "en"
        ]
    },
    "NIC": {
        "name": "Nicaragua",
        "native": "Nicaragua",
        "phone": "505",
        "continent": "NA",
        "capital": "Managua",
        "currency": "NIO",
        "languages": [
          "es"
        ]
    },
    "NLD": {
        "name": "Netherlands",
        "native": "Nederland",
        "phone": "31",
        "continent": "EU",
        "capital": "Amsterdam",
        "currency": "EUR",
        "languages": [
          "nl"
        ]
    },
    "NOR": {
        "name": "Norway",
        "native": "Norge",
        "phone": "47",
        "continent": "EU",
        "capital": "Oslo",
        "currency": "NOK",
        "languages": [
          "no",
          "nb",
          "nn"
        ]
    },
    "NPL": {
        "name": "Nepal",
        "native": "नपल",
        "phone": "977",
        "continent": "AS",
        "capital": "Kathmandu",
        "currency": "NPR",
        "languages": [
          "ne"
        ]
    },
    "NRU": {
        "name": "Nauru",
        "native": "Nauru",
        "phone": "674",
        "continent": "OC",
        "capital": "Yaren",
        "currency": "AUD",
        "languages": [
          "en",
          "na"
        ]
    },
    "NIU": {
        "name": "Niue",
        "native": "Niuē",
        "phone": "683",
        "continent": "OC",
        "capital": "Alofi",
        "currency": "NZD",
        "languages": [
          "en"
        ]
    },
    "NZL": {
        "name": "New Zealand",
        "native": "New Zealand",
        "phone": "64",
        "continent": "OC",
        "capital": "Wellington",
        "currency": "NZD",
        "languages": [
          "en",
          "mi"
        ]
    },
    "OMN": {
        "name": "Oman",
        "native": "عمان",
        "phone": "968",
        "continent": "AS",
        "capital": "Muscat",
        "currency": "OMR",
        "languages": [
          "ar"
        ]
    },
    "PAN": {
        "name": "Panama",
        "native": "Panamá",
        "phone": "507",
        "continent": "NA",
        "capital": "Panama City",
        "currency": "PAB,USD",
        "languages": [
          "es"
        ]
    },
    "PER": {
        "name": "Peru",
        "native": "Perú",
        "phone": "51",
        "continent": "SA",
        "capital": "Lima",
        "currency": "PEN",
        "languages": [
          "es"
        ]
    },
    "PYF": {
        "name": "French Polynesia",
        "native": "Polynésie française",
        "phone": "689",
        "continent": "OC",
        "capital": "Papeetē",
        "currency": "XPF",
        "languages": [
          "fr"
        ]
    },
    "PNG": {
        "name": "Papua New Guinea",
        "native": "Papua Niugini",
        "phone": "675",
        "continent": "OC",
        "capital": "Port Moresby",
        "currency": "PGK",
        "languages": [
          "en"
        ]
    },
    "PHL": {
        "name": "Philippines",
        "native": "Pilipinas",
        "phone": "63",
        "continent": "AS",
        "capital": "Manila",
        "currency": "PHP",
        "languages": [
          "en"
        ]
    },
    "PAK": {
        "name": "Pakistan",
        "native": "Pakistan",
        "phone": "92",
        "continent": "AS",
        "capital": "Islamabad",
        "currency": "PKR",
        "languages": [
          "en",
          "ur"
        ]
    },
    "POL": {
        "name": "Poland",
        "native": "Polska",
        "phone": "48",
        "continent": "EU",
        "capital": "Warsaw",
        "currency": "PLN",
        "languages": [
          "pl"
        ]
    },
    "SPM": {
        "name": "Saint Pierre and Miquelon",
        "native": "Saint-Pierre-et-Miquelon",
        "phone": "508",
        "continent": "NA",
        "capital": "Saint-Pierre",
        "currency": "EUR",
        "languages": [
          "fr"
        ]
    },
    "PCN": {
        "name": "Pitcairn Islands",
        "native": "Pitcairn Islands",
        "phone": "64",
        "continent": "OC",
        "capital": "Adamstown",
        "currency": "NZD",
        "languages": [
          "en"
        ]
    },
    "PRI": {
        "name": "Puerto Rico",
        "native": "Puerto Rico",
        "phone": "1787,1939",
        "continent": "NA",
        "capital": "San Juan",
        "currency": "USD",
        "languages": [
          "es",
          "en"
        ]
    },
    "PSE": {
        "name": "Palestine",
        "native": "فلسطين",
        "phone": "970",
        "continent": "AS",
        "capital": "Ramallah",
        "currency": "ILS",
        "languages": [
          "ar"
        ]
    },
    "PRT": {
        "name": "Portugal",
        "native": "Portugal",
        "phone": "351",
        "continent": "EU",
        "capital": "Lisbon",
        "currency": "EUR",
        "languages": [
          "pt"
        ]
    },
    "PLW": {
        "name": "Palau",
        "native": "Palau",
        "phone": "680",
        "continent": "OC",
        "capital": "Ngerulmud",
        "currency": "USD",
        "languages": [
          "en"
        ]
    },
    "PRY": {
        "name": "Paraguay",
        "native": "Paraguay",
        "phone": "595",
        "continent": "SA",
        "capital": "Asunción",
        "currency": "PYG",
        "languages": [
          "es",
          "gn"
        ]
    },
    "QAT": {
        "name": "Qatar",
        "native": "قطر",
        "phone": "974",
        "continent": "AS",
        "capital": "Doha",
        "currency": "QAR",
        "languages": [
          "ar"
        ]
    },
    "REU": {
        "name": "Réunion",
        "native": "La Réunion",
        "phone": "262",
        "continent": "AF",
        "capital": "Saint-Denis",
        "currency": "EUR",
        "languages": [
          "fr"
        ]
    },
    "ROU": {
        "name": "Romania",
        "native": "România",
        "phone": "40",
        "continent": "EU",
        "capital": "Bucharest",
        "currency": "RON",
        "languages": [
          "ro"
        ]
    },
    "SRB": {
        "name": "Serbia",
        "native": "Србија",
        "phone": "381",
        "continent": "EU",
        "capital": "Belgrade",
        "currency": "RSD",
        "languages": [
          "sr"
        ]
    },
    "RUS": {
        "name": "Russia",
        "native": "Россия",
        "phone": "7",
        "continent": "EU",
        "capital": "Moscow",
        "currency": "RUB",
        "languages": [
          "ru"
        ]
    },
    "RWA": {
        "name": "Rwanda",
        "native": "Rwanda",
        "phone": "250",
        "continent": "AF",
        "capital": "Kigali",
        "currency": "RWF",
        "languages": [
          "rw",
          "en",
          "fr"
        ]
    },
    "SAU": {
        "name": "Saudi Arabia",
        "native": "العربية السعودية",
        "phone": "966",
        "continent": "AS",
        "capital": "Riyadh",
        "currency": "SAR",
        "languages": [
          "ar"
        ]
    },
    "SLB": {
        "name": "Solomon Islands",
        "native": "Solomon Islands",
        "phone": "677",
        "continent": "OC",
        "capital": "Honiara",
        "currency": "SBD",
        "languages": [
          "en"
        ]
    },
    "SYC": {
        "name": "Seychelles",
        "native": "Seychelles",
        "phone": "248",
        "continent": "AF",
        "capital": "Victoria",
        "currency": "SCR",
        "languages": [
          "fr",
          "en"
        ]
    },
    "SDN": {
        "name": "Sudan",
        "native": "السودان",
        "phone": "249",
        "continent": "AF",
        "capital": "Khartoum",
        "currency": "SDG",
        "languages": [
          "ar",
          "en"
        ]
    },
    "SWE": {
        "name": "Sweden",
        "native": "Sverige",
        "phone": "46",
        "continent": "EU",
        "capital": "Stockholm",
        "currency": "SEK",
        "languages": [
          "sv"
        ]
    },
    "SGP": {
        "name": "Singapore",
        "native": "Singapore",
        "phone": "65",
        "continent": "AS",
        "capital": "Singapore",
        "currency": "SGD",
        "languages": [
          "en",
          "ms",
          "ta",
          "zh"
        ]
    },
    "SHN": {
        "name": "Saint Helena",
        "native": "Saint Helena",
        "phone": "290",
        "continent": "AF",
        "capital": "Jamestown",
        "currency": "SHP",
        "languages": [
          "en"
        ]
    },
    "SVN": {
        "name": "Slovenia",
        "native": "Slovenija",
        "phone": "386",
        "continent": "EU",
        "capital": "Ljubljana",
        "currency": "EUR",
        "languages": [
          "sl"
        ]
    },
    "SJM": {
        "name": "Svalbard and Jan Mayen",
        "native": "Svalbard og Jan Mayen",
        "phone": "4779",
        "continent": "EU",
        "capital": "Longyearbyen",
        "currency": "NOK",
        "languages": [
          "no"
        ]
    },
    "SVK": {
        "name": "Slovakia",
        "native": "Slovensko",
        "phone": "421",
        "continent": "EU",
        "capital": "Bratislava",
        "currency": "EUR",
        "languages": [
          "sk"
        ]
    },
    "SLE": {
        "name": "Sierra Leone",
        "native": "Sierra Leone",
        "phone": "232",
        "continent": "AF",
        "capital": "Freetown",
        "currency": "SLL",
        "languages": [
          "en"
        ]
    },
    "SMR": {
        "name": "San Marino",
        "native": "San Marino",
        "phone": "378",
        "continent": "EU",
        "capital": "City of San Marino",
        "currency": "EUR",
        "languages": [
          "it"
        ]
    },
    "SEN": {
        "name": "Senegal",
        "native": "Sénégal",
        "phone": "221",
        "continent": "AF",
        "capital": "Dakar",
        "currency": "XOF",
        "languages": [
          "fr"
        ]
    },
    "SOM": {
        "name": "Somalia",
        "native": "Soomaaliya",
        "phone": "252",
        "continent": "AF",
        "capital": "Mogadishu",
        "currency": "SOS",
        "languages": [
          "so",
          "ar"
        ]
    },
    "SUR": {
        "name": "Suriname",
        "native": "Suriname",
        "phone": "597",
        "continent": "SA",
        "capital": "Paramaribo",
        "currency": "SRD",
        "languages": [
          "nl"
        ]
    },
    "SSD": {
        "name": "South Sudan",
        "native": "South Sudan",
        "phone": "211",
        "continent": "AF",
        "capital": "Juba",
        "currency": "SSP",
        "languages": [
          "en"
        ]
    },
    "STP": {
        "name": "São Tomé and Príncipe",
        "native": "São Tomé e Príncipe",
        "phone": "239",
        "continent": "AF",
        "capital": "São Tomé",
        "currency": "STN",
        "languages": [
          "pt"
        ]
    },
    "SLV": {
        "name": "El Salvador",
        "native": "El Salvador",
        "phone": "503",
        "continent": "NA",
        "capital": "San Salvador",
        "currency": "SVC,USD",
        "languages": [
          "es"
        ]
    },
    "SXM": {
        "name": "Sint Maarten",
        "native": "Sint Maarten",
        "phone": "1721",
        "continent": "NA",
        "capital": "Philipsburg",
        "currency": "ANG",
        "languages": [
          "nl",
          "en"
        ]
    },
    "SYR": {
        "name": "Syria",
        "native": "سوريا",
        "phone": "963",
        "continent": "AS",
        "capital": "Damascus",
        "currency": "SYP",
        "languages": [
          "ar"
        ]
    },
    "SWZ": {
        "name": "Swaziland",
        "native": "Swaziland",
        "phone": "268",
        "continent": "AF",
        "capital": "Lobamba",
        "currency": "SZL",
        "languages": [
          "en",
          "ss"
        ]
    },
    "TCA": {
        "name": "Turks and Caicos Islands",
        "native": "Turks and Caicos Islands",
        "phone": "1649",
        "continent": "NA",
        "capital": "Cockburn Town",
        "currency": "USD",
        "languages": [
          "en"
        ]
    },
    "TCD": {
        "name": "Chad",
        "native": "Tchad",
        "phone": "235",
        "continent": "AF",
        "capital": "N'Djamena",
        "currency": "XAF",
        "languages": [
          "fr",
          "ar"
        ]
    },
    "ATF": {
        "name": "French Southern Territories",
        "native": "Territoire des Terres australes et antarctiques fr",
        "phone": "262",
        "continent": "AN",
        "capital": "Port-aux-Français",
        "currency": "EUR",
        "languages": [
          "fr"
        ]
    },
    "TGO": {
        "name": "Togo",
        "native": "Togo",
        "phone": "228",
        "continent": "AF",
        "capital": "Lomé",
        "currency": "XOF",
        "languages": [
          "fr"
        ]
    },
    "THA": {
        "name": "Thailand",
        "native": "ประเทศไทย",
        "phone": "66",
        "continent": "AS",
        "capital": "Bangkok",
        "currency": "THB",
        "languages": [
          "th"
        ]
    },
    "TJK": {
        "name": "Tajikistan",
        "native": "Тоҷикистон",
        "phone": "992",
        "continent": "AS",
        "capital": "Dushanbe",
        "currency": "TJS",
        "languages": [
          "tg",
          "ru"
        ]
    },
    "TKL": {
        "name": "Tokelau",
        "native": "Tokelau",
        "phone": "690",
        "continent": "OC",
        "capital": "Fakaofo",
        "currency": "NZD",
        "languages": [
          "en"
        ]
    },
    "TLS": {
        "name": "East Timor",
        "native": "Timor-Leste",
        "phone": "670",
        "continent": "OC",
        "capital": "Dili",
        "currency": "USD",
        "languages": [
          "pt"
        ]
    },
    "TKM": {
        "name": "Turkmenistan",
        "native": "Türkmenistan",
        "phone": "993",
        "continent": "AS",
        "capital": "Ashgabat",
        "currency": "TMT",
        "languages": [
          "tk",
          "ru"
        ]
    },
    "TUN": {
        "name": "Tunisia",
        "native": "تونس",
        "phone": "216",
        "continent": "AF",
        "capital": "Tunis",
        "currency": "TND",
        "languages": [
          "ar"
        ]
    },
    "TON": {
        "name": "Tonga",
        "native": "Tonga",
        "phone": "676",
        "continent": "OC",
        "capital": "Nuku'alofa",
        "currency": "TOP",
        "languages": [
          "en",
          "to"
        ]
    },
    "TUR": {
        "name": "Turkey",
        "native": "Türkiye",
        "phone": "90",
        "continent": "AS",
        "capital": "Ankara",
        "currency": "TRY",
        "languages": [
          "tr"
        ]
    },
    "TTO": {
        "name": "Trinidad and Tobago",
        "native": "Trinidad and Tobago",
        "phone": "1868",
        "continent": "NA",
        "capital": "Port of Spain",
        "currency": "TTD",
        "languages": [
          "en"
        ]
    },
    "TUV": {
        "name": "Tuvalu",
        "native": "Tuvalu",
        "phone": "688",
        "continent": "OC",
        "capital": "Funafuti",
        "currency": "AUD",
        "languages": [
          "en"
        ]
    },
    "TWN": {
        "name": "Taiwan",
        "native": "臺灣",
        "phone": "886",
        "continent": "AS",
        "capital": "Taipei",
        "currency": "TWD",
        "languages": [
          "zh"
        ]
    },
    "TZA": {
        "name": "Tanzania",
        "native": "Tanzania",
        "phone": "255",
        "continent": "AF",
        "capital": "Dodoma",
        "currency": "TZS",
        "languages": [
          "sw",
          "en"
        ]
    },
    "UKR": {
        "name": "Ukraine",
        "native": "Україна",
        "phone": "380",
        "continent": "EU",
        "capital": "Kyiv",
        "currency": "UAH",
        "languages": [
          "uk"
        ]
    },
    "UGA": {
        "name": "Uganda",
        "native": "Uganda",
        "phone": "256",
        "continent": "AF",
        "capital": "Kampala",
        "currency": "UGX",
        "languages": [
          "en",
          "sw"
        ]
    },
    "UMI": {
        "name": "U.S. Minor Outlying Islands",
        "native": "United States Minor Outlying Islands",
        "phone": "1",
        "continent": "OC",
        "capital": "",
        "currency": "USD",
        "languages": [
          "en"
        ]
    },
    "USA": {
        "name": "United States",
        "native": "United States",
        "phone": "1",
        "continent": "NA",
        "capital": "Washington D.C.",
        "currency": "USD,USN,USS",
        "languages": [
          "en"
        ]
    },
    "URY": {
        "name": "Uruguay",
        "native": "Uruguay",
        "phone": "598",
        "continent": "SA",
        "capital": "Montevideo",
        "currency": "UYI,UYU",
        "languages": [
          "es"
        ]
    },
    "UZB": {
        "name": "Uzbekistan",
        "native": "O‘zbekiston",
        "phone": "998",
        "continent": "AS",
        "capital": "Tashkent",
        "currency": "UZS",
        "languages": [
          "uz",
          "ru"
        ]
    },
    "VAT": {
        "name": "Vatican City",
        "native": "Vaticano",
        "phone": "39066,379",
        "continent": "EU",
        "capital": "Vatican City",
        "currency": "EUR",
        "languages": [
          "it",
          "la"
        ]
    },
    "VCT": {
        "name": "Saint Vincent and the Grenadines",
        "native": "Saint Vincent and the Grenadines",
        "phone": "1784",
        "continent": "NA",
        "capital": "Kingstown",
        "currency": "XCD",
        "languages": [
          "en"
        ]
    },
    "VEN": {
        "name": "Venezuela",
        "native": "Venezuela",
        "phone": "58",
        "continent": "SA",
        "capital": "Caracas",
        "currency": "VES",
        "languages": [
          "es"
        ]
    },
    "VGB": {
        "name": "British Virgin Islands",
        "native": "British Virgin Islands",
        "phone": "1284",
        "continent": "NA",
        "capital": "Road Town",
        "currency": "USD",
        "languages": [
          "en"
        ]
    },
    "VIR": {
        "name": "U.S. Virgin Islands",
        "native": "United States Virgin Islands",
        "phone": "1340",
        "continent": "NA",
        "capital": "Charlotte Amalie",
        "currency": "USD",
        "languages": [
          "en"
        ]
    },
    "VNM": {
        "name": "Vietnam",
        "native": "Việt Nam",
        "phone": "84",
        "continent": "AS",
        "capital": "Hanoi",
        "currency": "VND",
        "languages": [
          "vi"
        ]
    },
    "VUT": {
        "name": "Vanuatu",
        "native": "Vanuatu",
        "phone": "678",
        "continent": "OC",
        "capital": "Port Vila",
        "currency": "VUV",
        "languages": [
          "bi",
          "en",
          "fr"
        ]
    },
    "WLF": {
        "name": "Wallis and Futuna",
        "native": "Wallis et Futuna",
        "phone": "681",
        "continent": "OC",
        "capital": "Mata-Utu",
        "currency": "XPF",
        "languages": [
          "fr"
        ]
    },
    "WSM": {
        "name": "Samoa",
        "native": "Samoa",
        "phone": "685",
        "continent": "OC",
        "capital": "Apia",
        "currency": "WST",
        "languages": [
          "sm",
          "en"
        ]
    },
    "YEM": {
        "name": "Yemen",
        "native": "اليَمَن",
        "phone": "967",
        "continent": "AS",
        "capital": "Sana'a",
        "currency": "YER",
        "languages": [
          "ar"
        ]
    },
    "MYT": {
        "name": "Mayotte",
        "native": "Mayotte",
        "phone": "262",
        "continent": "AF",
        "capital": "Mamoudzou",
        "currency": "EUR",
        "languages": [
          "fr"
        ]
    },
    "ZAF": {
        "name": "South Africa",
        "native": "South Africa",
        "phone": "27",
        "continent": "AF",
        "capital": "Pretoria",
        "currency": "ZAR",
        "languages": [
          "af",
          "en",
          "nr",
          "st",
          "ss",
          "tn",
          "ts",
          "ve",
          "xh",
          "zu"
        ]
    },
    "ZMB": {
        "name": "Zambia",
        "native": "Zambia",
        "phone": "260",
        "continent": "AF",
        "capital": "Lusaka",
        "currency": "ZMK",
        "languages": [
          "en"
        ]
    },
    "ZWE": {
        "name": "Zimbabwe",
        "native": "Zimbabwe",
        "phone": "263",
        "continent": "AF",
        "capital": "Harare",
        "currency": "USD,ZAR,BWP,GBP,AUD,CNY,INR,JPY",
        "languages": [
          "en",
          "sn",
          "nd"
        ]
    }
}
