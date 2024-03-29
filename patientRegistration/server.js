const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');

require('dotenv-flow').config();

const app = express();
const PORT = process.env.PORT || 3001;

mongoose.connect(process.env.DBURI, {})
    .then(() => {
        console.log('Connected to MongoDB Atlas');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Error connecting to MongoDB Atlas : ', err);
    });

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded  request bodies. Useful when testing with Postman

app.use('/api', authRoutes);
app.use('/api/patient', patientRoutes);

module.exports = app;
// 
// const newPatient = new Patient({
//     patientId: 'testId',
//     name: 'Patient One',
//     email: 'patient@gmail.com',
//     address: 'Dubai, Uae',
//     phoneNumber: '0551234567',
//     dob: new Date(),
//     gender: 'male',
//     //Personal Medical History Info
//     medicalHistory: {
//         allergies: [
//             'none'
//         ],
//         knownIllness: [
//             'none'
//         ],
//     },
// })