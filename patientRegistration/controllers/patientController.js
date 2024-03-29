const SequenceParameters = require('../models/SequenceParameters')

const mongoose = require('mongoose');
const Patient = require('../models/Patient');

async function getNextSequence(counterName) {
    const SeqCounter = await SequenceParameters.findOne({ parameter: counterName });

    if (!SeqCounter) {
        console.log(`SequenceCounter ${counterName} not Found`);
    }

    SeqCounter.sequence += 1;
    console.log(`Next sequence: ${SeqCounter.sequence}`);
    await SeqCounter.save();

    return SeqCounter.sequence;
}

exports.register = async (req, res) => {
    try {
        const newPatient = new Patient({
            // patientId: await getNextSequence("patientregistration"),
            patientId: req.body.patientId,
            name: req.body.name,
            email: req.body.email,
            address: req.body.address,
            phoneNumber: req.body.phoneNumber,
            dob: req.body.dob,
            gender: req.body.gender,
            medicalHistory: req.body.medicalHistory,
        })
        const existingPatient = await Patient.findOne({
            $or: [
                { "email": req.body.email },
                { "phoneNumber": req.body.phoneNumber },
            ],
        });

        if (existingPatient) {
            return res.status(409).json({
                success: false,
                message: "Email or phone number already exists",
            });
        }
        await newPatient.save()
        res.status(200).json({
            success: true,
            message: `Patient registered!, PatientID: ${newPatient.patientId} `,
        });
    } catch (err) {
        if (err instanceof mongoose.Error.ValidationError)
            return res.status(400).json({ message: 'Valid role not provided. Try again with one of these valid roles: admin' });
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.getAllPatients = async (req, res) => {
    try {
        const patients = await Patient.find()
        res.send(patients)
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError)
            return res.status(400).json({ message: 'Valid role not provided. Try again with one of these valid roles: admin' });
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.getPatient = async (req, res) => {
    try {
        console.log(req.params.id);
        const patient = await Patient.findOne({ patientId: req.params.id })
        if (!patient) {
            res.status(404)
            res.send({ error: "Patient doesn't exist!" })
        }

        res.status(200).json({
            success: true,
            message: `Patient found!, Patient: ${patient} `,
        });
    } catch (error) {
        console.log(error);
        if (error instanceof mongoose.Error.ValidationError)
            return res.status(400).json({ message: 'Valid role not provided. Try again with one of these valid roles: admin' });
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.getPatientByEmail = async (req, res) => {
    try {
        const patient = await Patient.findOne({ email: req.params.email })
        if (!patient) {
            res.status(404)
            res.send({ error: "Patient doesn't exist!" })
        }

        res.status(200).json({
            success: true,
            message: `Patient found!, Patient: ${patient} `,
        });
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError)
            return res.status(400).json({ message: 'Valid role not provided. Try again with one of these valid roles: admin' });
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.updatePatient = async (req, res) => {
    try {
        if(Number.NaN(req.params.id))
        {
            res.status(404)
            res.send({ error: "Patient Id is invalid" })
        }

        const patient = await Patient.findOne({ patientId: req.params.id })

        if (!patient) {
            res.status(404)
            res.send({ error: "Patient doesn't exist!" })
        }

        if (req.body.name) patient.name = req.body.name
        if (req.body.email) patient.email = req.body.email
        if (req.body.address) patient.address = req.body.address
        if (req.body.phoneNumber) patient.phoneNumber = req.body.phoneNumber
        if (req.body.dob) patient.dob = req.body.dob
        if (req.body.gender) patient.gender = req.body.gender
        if (req.body.medicalHistory) patient.medicalHistory = req.body.medicalHistory

        await patient.save()

        res.status(200).json({
            success: true,
            message: `Patient Updated Successfully!, Patient: ${patient} `,
        });
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError)
            return res.status(400).json({ message: 'Valid role not provided. Try again with one of these valid roles: admin' });
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findOneAndDelete({ patientId: req.params.id })

        if (!patient) {
            res.status(404)
            res.send({ error: "Patient doesn't exist!" })
        }

        res.status(200).json({
            success: true,
            message: `Patient Records Deleted Successfully!`,
        });

    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError)
            return res.status(400).json({ message: 'Valid role not provided. Try again with one of these valid roles: admin' });
        res.status(500).json({ message: 'Internal server error' });
    }
}