const express = require('express');
const router = express.Router();
const multer = require('multer')
const { verifyToken,isAdmin } = require('../middlewares/authJwt');

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
router.get('/list', utilizadorController.list);
router.get('/:id/reservas',utilizadorController.getUtilizadorReservas)
router.get('/:id', utilizadorController.getUtilizador);
router.post('/add', utilizadorController.insertUtilizador);
router.post('/login', utilizadorController.login);
router.delete('/:id', utilizadorController.deleteUtilizador);
router.put('/:id', utilizadorController.editUtilizador);
router.post('/bulkAdd', utilizadorController.bulkInsertUtilizador);
module.exports = router;