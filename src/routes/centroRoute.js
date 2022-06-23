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
router.get('/list', centroController.list);
router.get('/:id/salas', centroController.getSalasCentro);
router.get('/:id/imagem', centroController.getCentroImagem);
router.get('/:id', centroController.getCentro);
router.post('/',upload.single('imagem'), centroController.insertCentro);
router.delete('/:id/imagem', centroController.deleteCentroImagem);
router.delete('/:id', centroController.deleteCentro);
router.put('/:id',upload.single('imagem'), centroController.editCentro);
module.exports = router;