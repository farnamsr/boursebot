
const {geturls, ticker} = require("./ticker");
const {START_INDEX} = require("./constants");
const cluster = require("cluster")
const os = require("os");
const cpus = os.cpus().length;


if(cluster.isMaster) {
    for(let i = 0; i < cpus; ++i) {
        cluster.fork();
    }
}
else{
    geturls().then((urls) => {
        let clusteredUrls = urls.filter((_, index) => index % cpus === cluster.worker.id - 1);
        ticker(clusteredUrls, START_INDEX, clusteredUrls.length, true);
    });
}