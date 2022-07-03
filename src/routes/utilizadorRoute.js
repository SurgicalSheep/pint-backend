const express = require('express');
const router = express.Router();
const multer = require('multer')
const {verifyAccessToken, isAdmin} = require("../middlewares/jwt")
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

const utilizadorController = require('../controllers/utilizadorController')
router.get('/list',verifyAccessToken,isAdmin, utilizadorController.list);
router.get('/:id/reservas',verifyAccessToken,utilizadorController.getUtilizadorReservas)
router.get('/getUserByToken',verifyAccessToken,utilizadorController.getUserByToken)
router.get('/:id/foto',verifyAccessToken,utilizadorController.getUtilizadorFoto)
router.get('/:id',verifyAccessToken, utilizadorController.getUtilizador);
router.post('/add',verifyAccessToken,isAdmin, upload.single('foto'), utilizadorController.insertUtilizador);
router.post('/addTestUsers',verifyAccessToken,isAdmin, utilizadorController.insertTestUtilizadores);
router.post('/login', utilizadorController.login);
router.post('/loginWeb', utilizadorController.loginWeb);
router.post('/refreshToken', utilizadorController.refreshToken);
router.delete('/logout', utilizadorController.logout);
router.delete('/:id/foto',verifyAccessToken,isAdmin, utilizadorController.deleteUtilizadorFoto);
router.delete('/:id',verifyAccessToken,isAdmin, utilizadorController.deleteUtilizador);
router.put('/:id', verifyAccessToken,upload.single('foto'), utilizadorController.editUtilizador);
router.post('/bulkAdd', utilizadorController.bulkInsertUtilizador);
module.exports = router;