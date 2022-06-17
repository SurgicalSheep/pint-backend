const redis = require("redis");
//let port = 6379;
//let host = "pint.72wvxo.clustercfg.euw3.cache.amazonaws.com"
const client = redis.createClient({url:process.env.REDIS_URL});

(async()=>{
    await client.connect();
})();

client.on("connect",()=>{
    console.log("Connected to redis...")
})
client.on("error",(err)=>{
    console.log(err.message)
})
client.on("ready",()=>{
    console.log("Connected to redis and ready to use...")
})
client.on("end",()=>{
    console.log("Connection terminated...")
})

process.on('SIGINT',()=>{
    client.quit();
})
module.exports = client;