const {TICKER, TIMEFRAMES, GROUPS, START_INDEX,URL_LIMIT} = require("./constants")
const {initialCandles} = require("./initCandles")
const mongo = require("./mongo");
const axios = require('axios');
const async = require("async");




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

async function ticker(urls, currentIndex, lastIndex, initCandles) {
    if(currentIndex < lastIndex) { 
        let chunk = urls.splice(START_INDEX, URL_LIMIT);
        let urlsCount = chunk.length;
        async.map(chunk,function(url) {
            axios.get(url, {timeout:5000}).then((resp) => {
                let promis = lastPrice(resp.data);
                 promis.then((price) => {
                    if(price) {
                        let code = url.split("i=")[1].split("&c=")[0];
                        if(initCandles) {
                            initialCandles(price, code).then(() => console.info(
                                new Date(), `process done.`
                            ));
                        }
                    }
                })
                urlsCount--;
                currentIndex++;
                if(urlsCount == 0) {
                    ticker(urls, currentIndex, lastIndex, initCandles);
                }
            })
        });
    } 
}


module.exports = { ticker, geturls }