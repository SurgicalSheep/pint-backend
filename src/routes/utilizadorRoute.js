const express = require('express');
const router = express.Router();
const multer = require('multer')
const {verifyAccessToken} = require("../middlewares/jwt")


const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'src/imgs/Utilizadores');
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
        return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
      }
    },
  });

const utilizadorController = require('../controllers/utilizadorController')
router.get('/list:limit?:offset?', utilizadorController.list);
router.get('/:id/reservas',utilizadorController.getUtilizadorReservas)
router.get('/getUserByToken',verifyAccessToken,utilizadorController.getUserByToken)
router.get('/:id', utilizadorController.getUtilizador);
router.post('/add', utilizadorController.insertUtilizador);
router.post('/addTestUsers', utilizadorController.insertTestUtilizadores);
router.post('/login', utilizadorController.login);
router.post('/refreshToken', utilizadorController.refreshToken);
router.delete('/logout', utilizadorController.logout);
router.delete('/:id', utilizadorController.deleteUtilizador);
router.put('/:id', utilizadorController.editUtilizador);
router.post('/bulkAdd', utilizadorController.bulkInsertUtilizador);
module.exports = router;