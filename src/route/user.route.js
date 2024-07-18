const express = require('express');
const router = express.Router();
const userController = require('../controller/user.controller');
const salesmanController = require('../controller/salesman.controller');
const upload = require('../middleware/imageupload');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/admin-approved', userController.updateIsAdminApproved);
router.get('/get-salesman',userController.getUser)
router.post('/salesman-add', upload.single('image'), salesmanController.addSalesman);
router.get('/get-salesman-by-id',salesmanController.getSalesmanByUserId)

module.exports = router;
