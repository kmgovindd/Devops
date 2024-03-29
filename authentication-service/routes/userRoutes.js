const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authorizeUser } = require('../middleware/authMiddleware');

router.post('/', authorizeUser("modify_user"), userController.register);
router.get('/:username', userController.getUser);
router.delete('/:username', authorizeUser("modify_user"), userController.disableUser);
router.put('/role/:username/:role', authorizeUser("modify_user"), userController.modifyRole);

module.exports = router;