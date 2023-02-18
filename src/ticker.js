const {TICKER, TIMEFRAMES, GROUPS, START_INDEX,URL_LIMIT} = require("./constants")
const mongo = require("./mongo");
const axios = require('axios');
const async = require("async");
const cluster = require("cluster")
const os = require("os");
const cpus = os.cpus().length;
let clustersExecuted = 0;

async function lastPrice(data) {
    return data.split(";")[0].split(",")[2];
}
async function geturls() {
    let urls = [];
    let db = await mongo.connection;
    let symbolsColl = db.collection("symbols");
    let symbols = await symbolsColl.find({}).toArray();
    for(let i in symbols) {
        urls.push(TICKER(symbols[i]["code"], GROUPS[symbols[i]["groupName"]]));
    }
    return urls;
}

async function ticker(urls, currentIndex, lastIndex) {
    if(currentIndex < lastIndex) { 
        let chunk = urls.splice(START_INDEX, URL_LIMIT);
        let urlsCount = chunk.length;
        async.map(chunk,function(url) {
            axios.get(url, {timeout:5000}).then((resp) => {
                let price = lastPrice(resp.data);
                urlsCount--;
                currentIndex++;
                if(urlsCount == 0) {
                    ticker(urls, currentIndex, lastIndex);
                }
            })
        });
    } else {console.log("done!!!");}
}


function run() {
    if(cluster.isMaster) {
        for(let i = 0; i < cpus; ++i) {
            cluster.fork();
        }
    }
    else{
        geturls().then((urls) => {
            let clustredUrls = urls.filter((_, index) => index % cpus === cluster.worker.id - 1);
            ticker(clustredUrls, START_INDEX, clustredUrls.length);
        });
    }
}

setInterval(function() { run() }, 10000)