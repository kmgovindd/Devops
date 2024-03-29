const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authorizeUser } = require('../middleware/authMiddleware');

router.get('/', authorizeUser(), patientController.getAllPatients);
router.get('/patients/:id', authorizeUser(), patientController.getPatient);
router.get('/:email', authorizeUser(), patientController.getPatientByEmail);
router.post('/', authorizeUser("add_or_edit_patient"), patientController.register);
router.patch('/:id', authorizeUser("add_or_edit_patient"), patientController.updatePatient);
router.delete('/:id', authorizeUser("delete_patient"), patientController.deletePatient)

module.exports = router;