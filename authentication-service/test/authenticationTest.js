let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../server");

chai.should();
chai.use(chaiHttp);

describe('Authentication Tests', function() {
  describe('POST /login', () => {
    it("Checks if the user can successfully login", (done) => {
      const userData = {
        username: 'admin',
        password: 'password'
        };
      
      chai.request(server)
        .post("/api/login/")
        .send(userData)
        .end((err, res) => {
            if (err) { done(err); return; }
            console.log(res.message);
            res.should.have.status(200);
            res.body.should.have.property('token');
            done();
        });
    })

    it("Checks if a login attempt with invalid credentials returns a 401 error", (done) => {
      const userData = {
        username: 'fakeaccount',
        password: 'nopasswordhere042'
        };

      chai.request(server)
        .post("/api/login")
        .send(userData)
        .end((err, res) => {
            if (err) { done(err); return; }
            res.should.have.status(401);
            done();
        })
    })
  })
})