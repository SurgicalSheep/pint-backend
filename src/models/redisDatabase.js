const redis = require("redis");
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