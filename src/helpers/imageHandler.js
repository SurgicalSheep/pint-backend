const sharp = require('sharp')
const fs = require('fs')
sharp.cache(false)

async function handleImage(path,id,dest) {
    try {
        await sharp(path).resize({width:150,height:150}).toFormat("jpeg",{mozjpeg:true}).toFile(dest+id+".jpeg");
        await fs.unlink(path,(err,result)=>{
            if(err)
            return err;
        })
        return (id+".jpeg")
    } catch (error) {
        return error;
    }
}

module.exports = handleImage