const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
let database = [];

chai.should();
chai.use(chaiHttp);

describe('Manage users',() => {
    describe('UC-201 Register new user /api/user',() => {
        beforeEach((done) => {
            database = [];
            done();
        });

        it('TC-201-1 When a required input is missing, a valid error should be returned',(done) => {
            chai
            .request(server)
            .post('/api/user')
            .send({
                // emailAdres is missing
                firstName: "Rik",
                lastName: "Vandermullen",
                password: "12345",
                street: "Kromme Slagen 3",
                city: "Breda"
            })
            .end((err, res) => {
                res.should.be.an('object');
                let {status, result} = res.body;
                status.should.equals(400);
                result.should.be.an('string').that.equals('Email address must be a string');
                done();
            });
        });

        it('TC-201-1 When a required input is missing, a valid error should be returned',(done) => {
            chai
            .request(server)
            .post('/api/user')
            .send({
                // firstName is missing
                emailAdress: "rik@gmail.com",
                lastName: "Vandermullen",
                password: "12345",
                street: "Kromme Slagen 3",
                city: "Breda"
            })
            .end((err, res) => {
                res.should.be.an('object');
                let {status, result} = res.body;
                status.should.equals(400);
                result.should.be.an('string').that.equals('First name must be a string');
                done();
            });
        });
    });
});