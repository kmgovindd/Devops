let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../server");
let patientSchema = require("../models/Patient");
const send = require("send");
const jwt = require('jsonwebtoken');
let config = require('../config');

//Assertion style
chai.should();
chai.use(chaiHttp);
chai.use(require('chai-json-schema'));

// Initialize auth token
let token = "0"
before(async () => {
    console.log("in before" + token);
    token = jwt.sign({ userId: 'admin', role: 'admin' }, config.jwtSecret, { expiresIn: config.jwtExpiry });
    console.log("in before" + token);
});

describe('Patient APIs', () => {
    //Get all patients
    describe('GET /api/patient/', () => {
        it("It should get all patients", (done) => {
            chai.request(server)
                .get("/api/patient/")
                .auth(token, { type: 'bearer' })
                .end((err, response) => {
                    const arrayItem = response.body[0];
                    response.should.have.status(200);
                    response.body.should.be.a('array');
                    arrayItem.should.be.jsonSchema(patientSchema);
                    done();
                });
        });

        it("It should NOT GET all the patients", (done) => {
            chai.request(server)
                .get("/api/patients/")
                .auth(token, { type: 'bearer' })
                .end((err, response) => {
                    response.should.have.status(404);
                    done();
                });
        });
    });

    // GET patient by id
    describe("GET /api/patient/patients/:patientId", () => {
        it("It should GET a patient by ID", (done) => {
            const patientId = 3;
            chai.request(server)
                .get("/api/patient/patients/" + patientId)
                .auth(token, { type: 'bearer' })
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.jsonSchema(patientSchema);
                    done();
                });
        });

        it("It should NOT GET a patient by ID", (done) => {
            const patientId = 123;
            chai.request(server)
                .get("/api/patient/patients/" + patientId)
                .auth(token, { type: 'bearer' })
                .end((err, response) => {
                    response.should.have.status(404);
                    done();
                });
        });
    });

    // GET patient by email
    describe("GET /api/patient/:patientEmail", () => {
        it("It should GET a patient by email", (done) => {
            const patientEmail = 'patient10@gmail.com';
            chai.request(server)
                .get("/api/patient/" + patientEmail)
                .auth(token, { type: 'bearer' })
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.jsonSchema(patientSchema);
                    done();
                });
        });

        it("It should NOT GET a patient by email", (done) => {
            const patientEmail = 'pahhent32@gmail.com';
            chai.request(server)
                .get("/api/patient/" + patientEmail)
                .auth(token, { type: 'bearer' })
                .end((err, response) => {
                    response.should.have.status(404);
                    done();
                });
        });

    });
    
    // POST to create patient
    describe("POST /api/patient", () => {
        it("It should POST a patient", (done) => {
            const patient = {
                patientId: 'testId',
                name: 'Patient One',
                email: 'patient@gmail.com',
                address: 'Dubai, Uae',
                phoneNumber: '0551234567',
                dob: new Date(),
                gender: 'male',
                //Personal Medical History Info
                medicalHistory: {
                    allergies: [
                        'none'
                    ],
                    knownIllness: [
                        'none'
                    ],
                },
            }
            chai.request(server)
                .post("/api/patient/")
                .auth(token, { type: 'bearer' })
                .send(patient)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.message.should.be.eq("Patient registered!, PatientID: testId ")
                    done();
                });
        });

        it("It should NOT POST a patient", (done) => {
            const patient = {
                patientId: 'testId',
                name: 'Patient One',
                email: 'patient10@gmail.com',
                address: 'Dubai, Uae',
                phoneNumber: '0551234567',
                dob: new Date(),
                gender: 'male',
                //Personal Medical History Info
                medicalHistory: {
                    allergies: [
                        'none'
                    ],
                    knownIllness: [
                        'none'
                    ],
                },
            }
            chai.request(server)
                .post("/api/patient/")
                .auth(token, { type: 'bearer' })
                .send(patient)
                .end((err, response) => {
                    response.should.have.status(409);
                    done();
                });

        });

        // should not create a new patient if email already exists
        it("It should NOT POST a patient if email already exists", (done) => {
            const patient = {
                patientId: 'testId',
                name: 'Patient One',
                email: 'patient@gmail.com',
                address: 'Dubai, Uae',
                phoneNumber: '0551234567',
                dob: new Date(),
                gender: 'male',
                //Personal Medical History Info
                medicalHistory: {
                    allergies: [
                        'none'
                    ],
                    knownIllness: [
                        'none'
                    ],
                },
            }
            chai.request(server)
                .post("/api/patient/")
                .auth(token, { type: 'bearer' })
                .send(patient)
                .end((err, response) => {
                    response.should.have.status(409);
                    done();
                });

        });

        it("It should NOT POST a patient if the phone number already exists", (done) => {            
            const patient = {
                patientId: 'testId',
                name: 'Patient One',
                email: 'patient@gmail.com',
                address: 'Dubai, Uae',
                phoneNumber: "0551234567",
                dob: new Date(),
                gender: 'male',
                medicalHistory: {
                    allergies: [
                        'none'
                    ],
                    knownIllness: [
                        'none'
                    ],
                },
            }
    
            chai.request(server)
                .post("/api/patient/")
                .auth(token, { type: 'bearer' })
                .send(patient)
                .end((err, response) => {
                    response.should.have.status(409);
                    done();
                });
            });

    });
    
    // PATCH to update patient
    describe("PATCH /api/patient/:id", () => {
        const patient ={
            email: "abcd@gmail.com"
        } 
        it("It should PATCH an existing patient", (done) => {
            const patientId = "testId";
            
            chai.request(server)
                .patch("/api/patient/" + patientId)
                .auth(token, { type: 'bearer' })
                .send(patient)
                .end((err, response) => {
                    response.should.have.status(200);
                    done();
                });
        });

        it("It should NOT PATCH a patient by ID", (done) => {
            const patientId = 123;
            chai.request(server)
                .patch("/api/patient/" + patientId)
                .auth(token, { type: 'bearer' })
                .send(patient)
                .end((err, response) => {
                    response.should.have.status(404);
                    done();
                });
        });
    });

    // DELETE to delete patient
    describe("DELETE /api/patient/:id", () => {
        it("It should DELETE an existing patient", (done) => {
            const patientId = "testId";
            chai.request(server)
                .delete("/api/patient/" + patientId)
                .auth(token, { type: 'bearer' })
                .end((err, response) => {
                    response.should.have.status(200);
                    done();
                });
        });

        it("It should NOT DELETE a patient by ID", (done) => {
            const patientId = 123;
            chai.request(server)
                .delete("/api/patient/" + patientId)
                .auth(token, { type: 'bearer' })
                .end((err, response) => {
                    response.should.have.status(404);
                done();
            });
        });
    });
});
