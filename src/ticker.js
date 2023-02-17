const {TICKER, TIMEFRAMES, GROUPS} = require("./constants")
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
        if(urls.length % 5 == 0) {
            ticker(urls);
            urls = [];
        }
    }
    
}

async function ticker(urls) {
    async.mapLimit(urls, 10,function(url) {
        try{
            axios.get(url, {timeout:5000}).then((resp) => {
                let price = lastPrice(resp.data);
                console.log(price);
            })
        }catch(err) {console.log("request timeout!");}
        
    })
    // const requests = urls.map((url) => axios.get(url));
    // axios.all(requests).then((responses) => {
    //     responses.forEach((resp) => {
    //       let msg = {
    //         server: resp.headers.server,
    //         status: resp.status,
    //         fields: Object.keys(resp.data).toString(),
    //       };
    //       console.info(resp.config.url);
    //       console.table(msg);
    //     });
    //   });

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


// ticker();
geturls();