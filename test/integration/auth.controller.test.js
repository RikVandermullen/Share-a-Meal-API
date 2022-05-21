process.env.DB_DATABASE = process.env.DB_DATABASE || '2116527'

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
const assert = require('assert')
require('dotenv').config()
const jwt = require('jsonwebtoken')
const dbconnection = require('../../database/dbconnection')
const logger = require('../../src/config/config').logger

chai.should();
chai.use(chaiHttp);

/**
 * Db queries to clear and fill the test database before each test.
 */
 const CLEAR_MEAL_TABLE = 'DELETE FROM meal;'
 const CLEAR_PARTICIPANTS_TABLE = 'DELETE FROM meal_participants_user;'
 const CLEAR_USERS_TABLE = 'DELETE FROM user;'
 const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE
 
 /**
  * Voeg een user toe aan de database. Deze user heeft id 1.
  * Deze id kun je als foreign key gebruiken in de andere queries, bv insert studenthomes.
  */
 const INSERT_USER =
     'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city`, `phoneNumber` ) VALUES' +
     '(1, "Rik", "Vandermullen", "rik@server.com", "Secrets0", "Kromme Slagen 3", "Breda", "06 12345678"),' +
     '(2, "Test", "Person", "test@server.com", "Secrets0", "Kromme Slagen 3", "Breda", "06 12345678");'
 
 /**
  * Query om twee meals toe te voegen. Let op de UserId, die moet matchen
  * met de user die je ook toevoegt.
  */
 const INSERT_MEALS =
     'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
     "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
     "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);"

describe('Manage login',() => {
    before((done) => {
        // clearing the test database
        dbconnection.getConnection(function(err, connection) {
            if (err) throw err;
            connection.query(CLEAR_MEAL_TABLE, function (error, message, field) {
                connection.query(CLEAR_PARTICIPANTS_TABLE, function (error, message, field) {
                    connection.query(CLEAR_USERS_TABLE, function (error, message, field) {
                        connection.release();
                        done();
                    });
                });
            });
        });
    })

    describe('UC-101 Login a user /api/auth/profile',() => {
        beforeEach((done) => {
            logger.debug('beforeEach called');
            dbconnection.getConnection(function (err, connection) {
                if (err) throw err // not connected!
                connection.query(CLEAR_MEAL_TABLE, function (error, messages, fields) {
                    // resets auto increment to 1
                    connection.query('ALTER TABLE meal AUTO_INCREMENT = 1;', (error, message, field) => {
                        connection.query(INSERT_USER, (error, message, field) => {
                            connection.query(INSERT_MEALS, (error, message, field) => {
                                connection.release()
                                if (error) throw error;
                                logger.debug('beforeEach done');
                                done();
                            })
                        })
                    })
                })
            })
        });

        it('TC-101-1 When a required input is missing, a valid error should be returned',(done) => {
            chai
            .request(server)
            .post('/api/auth/login')
            .send({
                emailAdress:"rik@server.com",
            })
            .end((err, res) => {
                res.should.be.an('object');
                let {status, message} = res.body;
                status.should.equals(400);
                message.should.be.an('string').that.equals('Password must be a string.');
                done();
            });
        });

        it('TC-101-2 When a invalid email adress is given, a valid error should be returned',(done) => {
            chai
            .request(server)
            .post('/api/auth/login')
            .send({
                emailAdress:"rikserver.com",
                password: "Secrets0"
            })
            .end((err, res) => {
                res.should.be.an('object');
                let {status, message} = res.body;
                status.should.equals(400);
                message.should.be.an('string').that.equals('This email address is not valid, please use a different one.');
                done();
            });
        });

        it('TC-101-3 When a invalid password is given, a valid error should be returned',(done) => {
            chai
            .request(server)
            .post('/api/auth/login')
            .send({
                emailAdress:"rik@server.com",
                password: "Secret"
            })
            .end((err, res) => {
                res.should.be.an('object');
                let {status, message} = res.body;
                status.should.equals(400);
                message.should.be.an('string').that.equals('This password is not valid, please use at least 8 characters, one digit, one lower case and one upper case.');
                done();
            });
        });

        it('TC-101-4 When a user does not exist, a valid error should be returned',(done) => {
            chai
            .request(server)
            .post('/api/auth/login')
            .send({
                emailAdress:"testuser@server.com",
                password: "Secrets0"
            })
            .end((err, res) => {
                res.should.be.an('object');
                let {status, message} = res.body;
                status.should.equals(404);
                message.should.be.an('string').that.equals('User not found or password invalid');
                done();
            });
        });

        it('TC-101-5 A user logged in succesfully',(done) => {
            chai
            .request(server)
            .post('/api/auth/login')
            .send({
                emailAdress:"rik@server.com",
                password: "Secrets0"
            })
            .end((err, res) => {
                res.should.be.an('object');
                let {status, result} = res.body;
                status.should.equals(200);
                let expected = {
                    city: "Breda",
                    emailAdress : "rik@server.com",
                    firstName: "Rik",
                    id: 1,
                    isActive: 1,
                    lastName: "Vandermullen",
                    phoneNumber: "06 12345678",
                    roles: "editor,guest",
                    street: "Kromme Slagen 3",
                    token: result.token
                }
                assert.deepEqual(result,expected);
                done();
            });
        });
    })
})
