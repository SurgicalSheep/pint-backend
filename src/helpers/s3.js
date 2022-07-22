const AWS = require("aws-sdk")
const fs = require("fs");
const createError = require('http-errors');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'eu-west-3'
  })

async function sendFotoUtilizador(path,key) {
      const blob = fs.readFileSync(path)
      const params = {
        Bucket: process.env.S3_BUCKET,
        Key: "imgs/utilizadores/"+key+".jpeg",
        Body: blob,
        ContentEncoding: 'base64',
        ContentType: 'image/jpeg'
    };
      const uploadedImage = await s3.upload(params,function(err,data) {
        if(err) console.log("no Key")
      }).promise()

      fs.unlink(path, (err, result) => {
        if (err) return err;
      });
      return (uploadedImage.Location)
}

async function sendImagemCentro(path,key) {

  const blob = fs.readFileSync(path)
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: "imgs/centros/"+key+".jpeg",
    Body: blob,
    ContentEncoding: 'base64',
    ContentType: 'image/jpeg'
};
  const uploadedImage = await s3.upload(params,function(err,data) {
    if(err) console.log("no Key")
  }).promise()

  fs.unlink(path, (err, result) => {
    if (err) return err;
  });
  return (uploadedImage.Location)
}

async function getFileUtilizador(key) {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: "imgs/utilizadores/"+key+".jpeg"
  }
  s3.getObject(params)
   const image = await s3.getObject(params, function(err, data) {
  }).promise();
  let base64 = image.Body.toString('base64')
  return (base64)
  } catch (error) {
    return ""
  }
      
}

async function getImagemCentro(key) {
    
  try {
    return new Promise(async(resolve, reject) => {
      const params = {
        Bucket: process.env.S3_BUCKET,
        Key: "imgs/centros/"+key+".jpeg"
    }
    s3.getObject(params)
     const image = await s3.getObject(params, function(err, data) {
      if(err) reject("")
    }).promise();
    let base64 = image.Body.toString('base64')
    resolve(base64)
    });
  } catch (error) {
    return ""
  }
  
}

async function deleteImagemUtilizador(key){
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: "imgs/utilizadores/"+key+".jpeg"
}
s3.deleteObject(params,(err,data)=>{
  if(err) console.log("no Key")
})
}


async function deleteImagemCentro(key){
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: "imgs/centros/"+key+".jpeg"
}
s3.deleteObject(params,(err,data)=>{
  if(err) console.log("no Key")
})
}
module.exports = {
    sendFotoUtilizador:sendFotoUtilizador,
    getFileUtilizador:getFileUtilizador,
    deleteImagemUtilizador:deleteImagemUtilizador,
    sendImagemCentro:sendImagemCentro,
    getImagemCentro:getImagemCentro,
    deleteImagemCentro:deleteImagemCentro
}