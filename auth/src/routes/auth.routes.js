const express = require('express');
const router = express.Router();
const validators = require('../middleware/validator.middleware');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/register', validators.registerUserValidations, authController.registerUser);
router.post('/login', validators.loginUserValidations, authController.loginUser);

router.get('/me',  authMiddleware.authMiddleware, authController.getCurrentUser);

router.get('/logout', authController.logoutUser);





module.exports = router;