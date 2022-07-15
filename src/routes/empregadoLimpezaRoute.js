const express = require('express');
const router = express.Router();
const {verifyAccessToken, isAdmin} = require("../middlewares/jwt")
const multer = require('multer')

const createError = require('http-errors')


const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'public/imgs/utilizadores');
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

const empregadoLimpezaController = require('../controllers/empregadoLimpezaController')
router.get('/list',verifyAccessToken, empregadoLimpezaController.list);
router.get('/:id',verifyAccessToken, empregadoLimpezaController.getEmpregadoLimpeza);
router.post('/add',verifyAccessToken,upload.single('foto'),empregadoLimpezaController.insertEmpregadoLimpeza);
router.post('/makeUtilizador/:id',verifyAccessToken,empregadoLimpezaController.makeUtilizador);
router.delete('/:id',verifyAccessToken, empregadoLimpezaController.deleteEmpregadoLimpeza);
router.put('/:id',verifyAccessToken, empregadoLimpezaController.editEmpregadoLimpeza);
module.exports = router;