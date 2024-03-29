const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authorizeUser } = require('../middleware/authMiddleware');

router.post('/login', authController.login);

// Debug/Test routes
router.use('/canRegister', authorizeUser("register_user"), authController.authTest);
router.use('/canModify', authorizeUser("modify_user"), authController.authTest);
router.post('/createrole', authorizeUser("modify_user"), authController.roleCreate);

module.exports = router;