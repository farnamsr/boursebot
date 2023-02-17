const axios = require('axios');
const {BASE_URL, SYMBOLS_LIST} = require("./constants")
const DomParser = require('dom-parser');
const parser = new DomParser();
const mongo = require("./mongo");

async function extractSymbolsId() {
    let response = await axios.get(BASE_URL + SYMBOLS_LIST);
    let html = response.data;
    let dom = parser.parseFromString(html);
    let rows = dom.getElementsByTagName("tr");
    let ids = [];
    for(let i=1; i<rows.length; ++i) {
        let row = rows[i];
        let columns = row.getElementsByTagName("td"); 
        let nameCol = columns[6];
        let groupName = columns[2].innerHTML;
        let link = nameCol.firstChild;
        let name = link.textContent;
        let href = link.getAttribute("href");
        let code = href.substring(href.indexOf("inscode=")).split("=")[1];
        ids.push({
            name:name,
            code:code,
            groupName:groupName
        });
    }
    return ids;
}
async function insertSymbols(symbols) {
    let db = await mongo.connection;
    let coll = db.collection("symbols");
    await coll.insertMany(symbols);
    console.log("Inserted!!!");
    
}
async function run() {
    let symbols = await extractSymbolsId();
    insertSymbols(symbols);
}

run();