const chai = require('chai');
const chaiHttp = require('chai-http');
let server = require("../server");
const User = require('../models/User');

chai.use(chaiHttp);
const should = chai.should(); 

let authToken;

const adminCredentials = {
  username: 'admin',
  password: 'password'
};

const userTestPreset = {
  username: 'usercreatetest',
  email: 'usercreatetest@gmail.com',
  password: 'usercreatetestpassword',
  role: 'doctor'
};

function userWithoutAttribute(attributeToRemove) {
  const userData = { ...userTestPreset };
  delete userData[attributeToRemove];
  return userData;
}

async function requestWithToken(method, url, data) {
  return chai.request(server)
    [method](url)
    .set('Authorization', `Bearer ${authToken}`)
    .send(data);
}

describe('User Controller Tests', function() {
  before(async () => {
    const res = await chai.request(server)
      .post('/api/login')
      .send(adminCredentials);

    authToken = res.body.token; // Assuming the token is returned in the response
  });

  afterEach(async () => {
    await User.deleteOne({ username: userTestPreset.username });
  });

  after(function () {
    global.isTestsCompleted = true;
  });

  describe('POST /', () => {
    it('should create a new user', (done) => {
      requestWithToken('post', '/api/user/', userTestPreset).then((res) => {
        res.should.have.status(201); 
        done();
      }).catch((err) => done(err));
    });

    it('should return an error if username is not provided', (done) => {
      requestWithToken('post', '/api/user/', userWithoutAttribute('username')).then((res) => {
        res.should.have.status(400); 
        done();
      }).catch((err) => done(err))
    });

    it('should return an error if email is not provided', (done) => {
      requestWithToken('post', '/api/user/', userWithoutAttribute('email')).then((res) => {
        res.should.have.status(400); 
        done();
      }).catch((err) => done(err))
    });

    it('should return an error if password is not provided', (done) => {
      requestWithToken('post', '/api/user/', userWithoutAttribute('password')).then((res) => {
        res.should.have.status(400); 
        done();
      }).catch((err) => done(err))
    });

    // Add more test cases for other scenarios
  });

  describe('GET /:username', () => {
    it('should get user by username', (done)=> {
      requestWithToken('post', '/api/user/', userTestPreset).then((res) => {
        res.should.have.status(201); 
        requestWithToken('get', `/api/user/${userTestPreset.username}`, null).then((res) => {
          res.should.have.status(200); 
          res.body.should.have.property('username').equal(userTestPreset.username); 
          res.body.should.have.property('email').equal(userTestPreset.email); 
          res.body.should.have.property('role').equal(userTestPreset.role); 
          done();
        })
      }).catch((err) => done(err));
    });

    // Add more tests
  });

  describe('DELETE /:username', () => {
    it('should disable user given a username', async () => {
      const createUserResponse = await requestWithToken('post', '/api/user/', userTestPreset);
      createUserResponse.should.have.status(201);
      
      const deleteUserResponse = await requestWithToken('delete', `/api/user/${userTestPreset.username}/`);
      deleteUserResponse.should.have.status(200);
      
      const disabledUser = await User.findOne({ username: userTestPreset.username }).exec();
      
      disabledUser.should.exist;
      disabledUser.isDisabled.should.be.true;
    });
  });
  describe('PUT /role/:username/:role', () => {
    it('should update the role for a given username', async () => {
      const createUserResponse = await requestWithToken('post', '/api/user/', userTestPreset);
      createUserResponse.should.have.status(201);
      
      const updateRoleResponse = await requestWithToken('put', `/api/user/role/${userTestPreset.username}/clerk/`);
      updateRoleResponse.should.have.status(200);
      
      const user = await User.findOne({ username: userTestPreset.username }).exec();

      user.should.exist;
      user.role.should.equal('clerk');
    });
  });
});
