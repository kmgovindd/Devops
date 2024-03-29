const LabTypes = require('../models/labregistration/LabTypes');
const LabRequestStatuses = require('../models/labRequestStatuses');
const SequenceParameters = require('../models/SequenceParameters');
const LabRegistrations = require('../models/labregistration/labRegistrations');
const config = require('../config');


const AWS = require('aws-sdk');
const fs = require('fs');
const { model } = require('mongoose');

const s3 = new AWS.S3({
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  region: config.AWS_REGION,
  signatureVersion: config.AWS_SIGNATURE
});


async function uploadSingleFile(fileName, filePath, labBooking, res) {
  const fileContent = fs.readFileSync(filePath);

  const date = new Date();
  const milliseconds = date.getTime();
  console.log(milliseconds);

  fileName = milliseconds + "-" + fileName;

  const params = {
    Bucket: config.AWS_BUCKET,
    Key: fileName,
    Body: fileContent
  };

  s3.upload(params, (err, data) => {
    if (err) {
      console.error('Error uploading file:', err);
      return null;
    } else {
      console.log(data);
      console.log(`File uploaded successfully. ${data.Location}`);

      let params3 = { Bucket: config.AWS_BUCKET, Key: fileName };
      let url = s3.getSignedUrl('getObject', params3);
      console.log('The URL is', url);
      labBooking.modifiedAt = new Date();
      labBooking.labReports = url;

      labBooking.save();

      return res.status(200).json({
        success: true,
        message: "Lab Test Completed successfully",
        data: labBooking,
      });

    }
  });


}



async function getNextSequence(counterName) {
  const SeqCounter = await SequenceParameters.findOne({ parameter: counterName });

  if (!SeqCounter) {
    console.log(`SequenceCounter ${counterName} not Found`);
  }

  SeqCounter.sequence += 1;
  await SeqCounter.save();

  return SeqCounter.sequence;
}

exports.addlabtypes = async (req, res) => {
  try {
    const { labtypeid, description } = req.body;

    if (!labtypeid || !description) {
      return res.status(401).json({ message: 'Invalid Lab types details' });
    }

    const existingUser = await LabTypes.findOne({ labtypeid });
    if (existingUser) {
      return res.status(400).json({ message: 'Lab type already exists' });
    }
    const newLabType = new LabTypes({ labtypeid, description });
    await newLabType.save();
    res.status(201).json({ message: 'Lab Type created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' + err });
  }
};

exports.addlabRequestStatus = async (req, res) => {
  try {
    const { reqstatusid, description } = req.body;

    if (!reqstatusid || !description) {
      return res.status(401).json({ message: 'Invalid Lab Request Status details' });
    }

    const existingStatus = await LabRequestStatuses.findOne({ reqstatusid });
    if (existingStatus) {
      return res.status(400).json({ message: 'Lab Request Status already exists' });
    }
    const newLabRequestStatus = new LabRequestStatuses({ reqstatusid, description });
    await newLabRequestStatus.save();
    res.status(201).json({ message: 'Lab Request Status created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' + err });
  }
};

exports.addSequenceParameters = async (req, res) => {
  try {
    const { parameter, sequence } = req.body;

    if (!parameter || !sequence) {
      return res.status(401).json({ message: 'Invalid Sequence Parameter details' });
    }

    const existingParameter = await SequenceParameters.findOne({ parameter });
    if (existingParameter) {
      return res.status(400).json({ message: 'Sequence Parameter already exists' });
    }
    const newSeqParameter = new SequenceParameters({ parameter, sequence });
    await newSeqParameter.save();
    res.status(201).json({ message: 'Sequence Parameter created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' + err });
  }
};

exports.registerLab = async (req, res) => {
  try {
    const { patientid, labtypeid, reqstatusid, bookeddate } = req.body;

    if (!patientid || !labtypeid || !reqstatusid || !bookeddate) {
      return res.status(401).json({ message: 'Invalid Lab Registration details' });
    }
    const bookDateObj = new Date(bookeddate);
   

    const existingBooking = await LabRegistrations.findOne({ patientid, labtypeid, reqstatusid });
    if (existingBooking) {
      return res.status(400).json({ message: 'Booking already exists', registrationid: existingBooking.registrationid });
    }

    const newRegistration = new LabRegistrations({
      "labReports": '',
      "reportBy": '',
      "patientid": patientid,
      "labtypeid": labtypeid,
      "reqstatusid": reqstatusid,
      "bookeddate": bookDateObj,
      "registeredAt": new Date(),
      "modifiedAt": new Date(),
      "labRemarks": '',
      registrationid: await getNextSequence("labregistration"),
    });

    await newRegistration.save();
    res.status(201).json({ message: 'Booking created successfully', registrationid: newRegistration.registrationid });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' + err });
  }
};


exports.reserveLab = async (req, res) => {
  try {
    const labBooking = await LabRegistrations.findOne({ registrationid: req.body.registrationid });
    if (!labBooking || labBooking.reportBy != '') {

      return res
        .status(404)
        .json({ success: false, message: "Lab Booking not found or already reserved" });
    }
    labBooking.reportBy = req.body.reportBy;
    labBooking.modifiedAt = new Date();
    labBooking.reqstatusid = 2;

    const updatedBooking = await labBooking.save();

    res.status(200).json({
      success: true,
      message: "Lab Booking Reserved successfully",
      data: updatedBooking,
    });
  } catch (error) {

    console.error(error);
    res.status(500).json({
      success: false,
      message: "Lab Booking reservation failed",
      error: error.message,
    });
  }
};

exports.completeLabReport = async (req, res) => {
  try {
    const labBooking = await LabRegistrations.findOne({ registrationid: req.body.registrationid });
    if (!labBooking) {

      return res
        .status(404)
        .json({ success: false, message: "Lab Booking not found" });
    }

    labBooking.labRemarks = req.body.labRemarks;
    await uploadSingleFile(req.body.fileName, req.body.filePath, labBooking, res);




  } catch (error) {

    console.error(error);
    res.status(500).json({
      success: false,
      message: "Lab Test Completion failed",
      error: error.message,
    });
  }
};

exports.fetchAllLabTypes = async (req, res) => {
  try {
    const filter = {};
    const all = await LabTypes.find(filter).select({
      labtypeid: 1,
      description: 2,
      _id: 0,
    });

    if (!all) {

      return res.status(404).send({ message: "No Lab Types Found" });
    }

    res.status(200).send({
      success: true,
      message: "Lab Test Types details available",
      labtypes: all,
    });
  } catch (error) {

    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve patients details",
      error: error.message,
    });
  }
};

exports.cancelLabRegistration = async (req, res) => {
  try {
    const { registrationid } = req.body;
    const labRegistration = await LabRegistrations.findOne({ registrationid });

    if (!labRegistration) {
      return res.status(404).json({ message: 'Lab Registration not found' });
    }

    if (labRegistration.reqstatusid !== 1) {
      return res.status(400).json({ message: 'Lab Registration cannot be canceled. Status is not "Scheduled"' });
    }

    labRegistration.reqstatusid = 4;
    labRegistration.modifiedAt = new Date();
    await labRegistration.save();

    res.status(200).json({ message: 'Lab Registration canceled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to cancel Lab Registration', error: error.message });
  }
};