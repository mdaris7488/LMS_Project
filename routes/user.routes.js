const express = require('express');
const { register, login, logout, getProfile, forgotPassword, resetPassword, changePassword, UpdateUser } = require('../controllers/user.controller');
const isLoggedIn = require('../middleware/auth.middleware');
const upload = require('../middleware/multer.middleware');
const router = express.Router();

router.post('/register', upload.single("avatar"), register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', isLoggedIn, getProfile);
router.post('/reset', forgotPassword);
router.post('/reset/:resetToken', resetPassword);
router.post('/changePassword', isLoggedIn, changePassword);
router.put('/update', isLoggedIn, upload.single("avatar"), UpdateUser)


module.exports = router;