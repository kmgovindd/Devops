let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../server");
const send = require("send");
const jwt = require('jsonwebtoken');
let config = require('../config');

const LabRequestStatuses = require('../models/labRequestStatuses');
const LabTypes = require('../models/labregistration/LabTypes');
const LabRegistrations = require('../models/labregistration/labRegistrations');
const SequenceParameters = require('../models/SequenceParameters');

//Assertion style
chai.should();

chai.use(chaiHttp);
chai.use(require('chai-json-schema'));

let token = "0";

//clean up the database before and after each test
before(async () => {
    await LabRequestStatuses.deleteMany({}).exec();
    await LabTypes.deleteMany({}).exec();
    await LabRegistrations.deleteMany({}).exec();
    await SequenceParameters.deleteMany({}).exec();
    token = jwt.sign({ userId: 'admin', role: 'admin' }, config.jwtSecret, { expiresIn: config.jwtExpiry });
    console.log("in before" + token);
});

describe("Lab Operations Test", () => {


    // POST to create lab types
    describe("Testing Lab Types Addition", () => {
        it("It should create Lab Type", (done) => {

            const labType = {
                labtypeid: '2',
                description: 'CT Scan'
            }
            chai.request(server)
                .post("/api/lab/types")
                .auth(token, { type: 'bearer' })
                .send(labType)
                .end((err, response) => {
                    response.should.have.status(201);
                    response.body.message.should.be.eq("Lab Type created successfully")
                    done();
                });
        });

        it("It should not create Lab Type", (done) => {
            const labType = {
                labtypeid: '2',
                description: 'CT Scan'
            }
            chai.request(server)
                .post("/api/lab/types")
                .auth(token, { type: 'bearer' })
                .send(labType)
                .end((err, response) => {
                    response.should.have.status(400);
                    response.body.message.should.be.eq("Lab type already exists")
                    done();
                });
        });

    });

    // POST to create lab request status
    describe("Testing Lab Request Status Addition", () => {
        it("It should create Lab Request Status", (done) => {
            const labRequestStatus = {
                reqstatusid: '4',
                description: "Cancelled"
            }
            chai.request(server)
                .post("/api/lab/status")
                .auth(token, { type: 'bearer' })
                .send(labRequestStatus)
                .end((err, response) => {
                    response.should.have.status(201);
                    response.body.message.should.be.eq("Lab Request Status created successfully")
                    done();
                });
        });

        it("It should NOT create Lab Request Status", (done) => {
            const labRequestStatus = {
                reqstatusid: '4',
                description: "Cancelled"
            }
            chai.request(server)
                .post("/api/lab/status")
                .auth(token, { type: 'bearer' })
                .send(labRequestStatus)
                .end((err, response) => {
                    response.should.have.status(400);
                    response.body.message.should.be.eq("Lab Request Status already exists")
                    done();
                });
        });
    });

    // POST to create sequence parameters
    describe("Testing Sequence Parameters Addition", () => {
        it("It should create new sequence parameter", (done) => {
            const sequenceParameter = {
                parameter: 'labregistration',
                sequence: '1'
            }
            chai.request(server)
                .post("/api/lab/sequence")
                .auth(token, { type: 'bearer' })
                .send(sequenceParameter)
                .end((err, response) => {
                    response.should.have.status(201);
                    response.body.message.should.be.eq("Sequence Parameter created successfully")
                    done();
                });
        });

        it("It should not create new sequence parameter", (done) => {
            const sequenceParameter = {
                parameter: 'labregistration',
                sequence: '1'
            }
            chai.request(server)
                .post("/api/lab/sequence")
                .auth(token, { type: 'bearer' })
                .send(sequenceParameter)
                .end((err, response) => {
                    response.should.have.status(400);
                    response.body.message.should.be.eq("Sequence Parameter already exists")
                    done();
                });
        });
    });

    // POST to register laboratory
    describe("Testing Lab Registration", () => {
        it("It should register a Lab Appointment", (done) => {
            const labRegistration = {
                patientid: '123456',
                labtypeid: '2',
                reqstatusid: '1',
                bookeddate: '2025/03/15'
            }
            chai.request(server)
                .post("/api/lab/registration")
                .auth(token, { type: 'bearer' })
                .send(labRegistration)
                .end((err, response) => {
                    response.should.have.status(201);
                    response.body.message.should.be.eq("Booking created successfully");
                    done();
                });
        });

        it("It should not register a Lab Appointment", (done) => {
            const labRegistration = {
                patientid: '123456',
                labtypeid: '2',
                reqstatusid: '1',
                bookeddate: '2025/03/15'
            }
            chai.request(server)
                .post("/api/lab/registration")
                .auth(token, { type: 'bearer' })
                .send(labRegistration)
                .end((err, response) => {
                    response.should.have.status(400);
                    response.body.message.should.be.eq("Booking already exists");
                    done();
                });
        });
    });

    // POST to reserve laboratory
    describe("Testing Lab Reservation", () => {
        it("It should reserve a laboratory", (done) => {
            const reservationData = {
                registrationid: '2',
                reportBy: 'John Walker'
            }
            chai.request(server)
                .post("/api/lab/reservation")
                .auth(token, { type: 'bearer' })
                .send(reservationData)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.success.should.be.true;
                    response.body.message.should.be.eq("Lab Booking Reserved successfully");
                    done();
                });
        });

        it("It should NOT reserve a laboratory if booking not found or already reserved", (done) => {
            const reservationData = {
                registrationid: '3',
                reportBy: 'John Doe'
            }
            chai.request(server)
                .post("/api/lab/reservation")
                .auth(token, { type: 'bearer' })
                .send(reservationData)
                .end((err, response) => {
                    response.should.have.status(404);
                    response.body.success.should.be.false;
                    response.body.message.should.be.eq("Lab Booking not found or already reserved");
                    done();
                });
        });
    });

    // POST to cancel lab registration
    describe("Test for Lab Registration Cancellation", () => {
        it("It should register a Lab Appointment", (done) => {
            const labRegistration = {
                patientid: '456789',
                labtypeid: '2',
                reqstatusid: '1',
                bookeddate: '2025/03/15'
            }
            chai.request(server)
                .post("/api/lab/registration")
                .auth(token, { type: 'bearer' })
                .send(labRegistration)
                .end((err, response) => {
                    response.should.have.status(201);
                    response.body.message.should.be.eq("Booking created successfully");
                    done();
                });
        });

        it("It should cancel a lab registration", (done) => {
            const cancellationData = {
                registrationid: '3'
            }
            chai.request(server)
                .post("/api/lab/cancelation")
                .auth(token, { type: 'bearer' })
                .send(cancellationData)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.message.should.be.eq("Lab Registration canceled successfully");
                    done();
                });
        });

        it("It should NOT cancel a lab registration if registration not found", (done) => {
            const cancellationData = {
                registrationid: '15'
            }
            chai.request(server)
                .post("/api/lab/cancelation")
                .auth(token, { type: 'bearer' })
                .send(cancellationData)
                .end((err, response) => {
                    response.should.have.status(404);
                    response.body.message.should.be.eq("Lab Registration not found");
                    done();
                });
        });

        it("It should NOT cancel a lab registration if status is not 'Scheduled'", (done) => {
            const cancellationData = {
                registrationid: '3'
            }
            chai.request(server)
                .post("/api/lab/cancelation")
                .auth(token, { type: 'bearer' })
                .send(cancellationData)
                .end((err, response) => {
                    response.should.have.status(400);
                    response.body.message.should.be.eq('Lab Registration cannot be canceled. Status is not "Scheduled"');
                    done();
                });
        });
    });
});


