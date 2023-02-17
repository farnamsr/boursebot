const {TICKER, TIMEFRAMES, GROUPS, START_INDEX,URL_LIMIT} = require("./constants")
const mongo = require("./mongo");
const axios = require('axios');
const async = require("async")

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
    if(currentIndex >= lastIndex) { console.log("finished"); return false; }
    let chunk = urls.splice(START_INDEX, URL_LIMIT);
    let urlsCount = chunk.length;
    async.map(chunk,function(url) {
        axios.get(url, {timeout:5000}).then((resp) => {
            let price = lastPrice(resp.data);
            urlsCount--;
            currentIndex++;
            console.log(currentIndex);
            if(urlsCount == 0) {
                ticker(urls, currentIndex, lastIndex);
            }
        })
    });



    // let db = await mongo.connection;
    // let symbolsColl = db.collection("symbols");
    // let liveColl = db.collection("live_candles");
    // for(let i in symbols) {
    //     // console.log(symbols[i]["code"]); return false;
    //     let price = await lastPrice(symbols[i]["code"], GROUPS[symbols[i]["groupName"]]);
    //     console.log(price); return false;
    //     liveColl.updateOne({
    //         code:symbols[i]["code"],
    //         timeframe:TIMEFRAMES.m1
    //     }, {$set: {high:price, low:price, open:price, close:price} },
    //     {"upsert":true})
    //     return false;
    // }
    // console.log("Done");
}




 geturls().then((urls) => {
    ticker(urls, START_INDEX, urls.length);
});