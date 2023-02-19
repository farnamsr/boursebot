const mongo = require("./mongo");
const {TIMEFRAMES} = require("./constants");

async function initialCandles(price, code) {
    let db = await mongo.connection;
        // open, close, low, high
        let oclh = new Array(4).fill(price);
        let doc_m1 = code+TIMEFRAMES.m1;
        let doc_m5 = code+TIMEFRAMES.m5;
        let doc_m10 = code+TIMEFRAMES.m10;
        let doc_m15 = code+TIMEFRAMES.m15;
        let doc_m30 = code+TIMEFRAMES.m30;
        db.collection("live_candles").updateMany(
                {symbol_tf:doc_m1},
                {$set: {data:oclh}},
                {"upsert":true}
        );
}


module.exports = { initialCandles }
