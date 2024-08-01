const express = require('express');
const router = express.Router();
const userController = require('../controller/user.controller');
const salesmanController = require('../controller/salesman.controller');
const notesController=require('../controller/notes.controller')
const upload = require('../middleware/imageupload');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/admin-approved', userController.updateIsAdminApproved);
router.post('/forgot-password',userController.forgotPassword)
router.post('/verify-code',userController.verifyCode)
router.post('/reset-password',userController.resetPassword)
router.get('/get-salesman',userController.getUser)
router.post('/salesman-add', upload.single('image'), salesmanController.addSalesman);
router.get('/get-salesman-by-id',salesmanController.getSalesmanByUserId)
router.get('/update-status',userController.updateStatus)
router.get('/get-salesman-insights',userController.getTotalSalesmenToday)
router.get('/get-location-list',salesmanController.getLocationData)
router.post('/check-admin-approval',userController.checkAdminApproval)
router.post('/update-location',userController.updateLocation)


router.post('/update-salesman-location',salesmanController.updateSalesmanLocation)
router.post('/write-notes',notesController.createNote)
router.get('/get-notes-by-id',notesController.getNoteById)
router.post('/update-notes',notesController.updateNote)

module.exports = router;
