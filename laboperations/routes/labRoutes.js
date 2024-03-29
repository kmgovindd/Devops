const express = require('express');
const router = express.Router();
const labController = require('../controllers/labController')
const { authorizeUser } = require('../middleware/authMiddleware');


router.post('/types', authorizeUser(),labController.addlabtypes);
router.get('/types/all', authorizeUser(),labController.fetchAllLabTypes);

router.post('/status', authorizeUser(),labController.addlabRequestStatus);

router.post('/sequence', authorizeUser(),labController.addSequenceParameters);

router.post('/registration',  authorizeUser("register_lab"), labController.registerLab);
router.post('/reservation', authorizeUser("reserve_lab"), labController.reserveLab);
router.post('/completion', authorizeUser("complete_lab"),labController.completeLabReport);
router.post('/cancelation', authorizeUser("cancel_lab"), labController.cancelLabRegistration);



module.exports = router;