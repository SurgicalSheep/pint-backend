const express = require('express');
const router = express.Router();
const multer = require('multer')
const {verifyAccessToken, isAdmin} = require("../middlewares/jwt")
const createError = require('http-errors')


const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'public/imgs/centros');
    },
    filename: function(req,file,cb){
        cb(null,Date.now() + file.originalname);
    }
})

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      if (
        file.mimetype == "image/png" ||
        file.mimetype == "image/jpg" ||
        file.mimetype == "image/jpeg"
      ) {
        cb(null, true); 
      } else {
        cb(null, false);
        return cb(createError.BadRequest("Only .png, .jpg and .jpeg format allowed!"));
      }
    },
  });

const centroController = require('../controllers/centroController')
router.get('/list',verifyAccessToken, centroController.list);
router.get('/:id/salas',verifyAccessToken, centroController.getSalasCentro);
router.get('/:id/imagem',verifyAccessToken, centroController.getCentroImagem);
router.get('/:id',verifyAccessToken, centroController.getCentro);
router.post('/',upload.single('imagem'),verifyAccessToken, centroController.insertCentro);
router.delete('/:id/imagem',verifyAccessToken, centroController.deleteCentroImagem);
router.delete('/:id',verifyAccessToken, centroController.deleteCentro);
router.put('/:id',upload.single('imagem'),verifyAccessToken,centroController.editCentro);
module.exports = router;