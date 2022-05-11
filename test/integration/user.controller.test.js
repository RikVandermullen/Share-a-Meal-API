process.env.DB_DATABASE = process.env.DB_DATABASE || '2116527'

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
const assert = require('assert')
require('dotenv').config()
const dbconnection = require('../../database/dbconnection')

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

describe('Manage users',() => {
    before((done) => {
        // clearing the test database
        dbconnection.getConnection(function(err, connection) {
            if (err) throw err;
            connection.query(CLEAR_MEAL_TABLE, function (error, result, field) {
                connection.query(CLEAR_PARTICIPANTS_TABLE, function (error, result, field) {
                    connection.query(CLEAR_USERS_TABLE, function (error, result, field) {
                        connection.release();
                        done();
                    });
                });
            });
        });
    })

    describe('UC-201 Register new user /api/user',() => {
        beforeEach((done) => {
            console.log('beforeEach called');
            dbconnection.getConnection(function (err, connection) {
                if (err) throw err // not connected!
                connection.query(CLEAR_USERS_TABLE, function (error, results, fields) {
                    // resets auto increment to 1
                    connection.query('ALTER TABLE user AUTO_INCREMENT = 1;', (error, result, field) => {
                        connection.query(INSERT_USER, (error, result, field) => {
                            connection.release()
                            if (error) throw error;
                            console.log('beforeEach done');
                            done();
                        })
                    })
                })
            })
        });

        it('TC-201-1 When a required input is missing, a valid error should be returned',(done) => {
            chai
            .request(server)
            .post('/api/user')
            .send({
                // firstName is missing
                lastName: "Vandermullen",
                street: "Kromme Slagen 3",
                city: "Breda",
                emailAdress: "rik@server.com",
                password: "Secrets0",
                phoneNumber: "06 12345678"
            })
            .end((err, res) => {
                res.should.be.an('object');
                let {status, result} = res.body;
                status.should.equals(400);
                result.should.be.an('string').that.equals('First name must be a string');
                done();
            });
        });

        it('TC-201-2 When an invalid email address is given, a valid error should be returned',(done) => {
            chai
            .request(server)
            .post('/api/user')
            .send({
                firstName: "Rik",
                lastName: "Vandermullen",
                street: "Kromme Slagen 3",
                city: "Breda",
                // missing an @
                emailAdress: "rikserver.com",
                password: "Secrets0",
                phoneNumber: "06 12345678"
            })
            .end((err, res) => {
                res.should.be.an('object');
                let {status, result} = res.body;
                status.should.equals(400);
                result.should.be.an('string').that.equals('This email address is not valid, please use a different one.');
                done();
            });
        });

        it('TC-201-3 When an invalid password is given, a valid error should be returned',(done) => {
            chai
            .request(server)
            .post('/api/user')
            .send({
                firstName: "Rik",
                lastName: "Vandermullen",
                street: "Kromme Slagen 3",
                city: "Breda",
                emailAdress: "rik@server.com",
                // doesn't contain at least 8 characters, 1 digit and 1 upper case letter
                password: "secret",
                phoneNumber: "06 12345678"
            })
            .end((err, res) => {
                res.should.be.an('object');
                let {status, result} = res.body;
                status.should.equals(400);
                result.should.be.an('string').that.equals('This password is not valid, please use at least 8 characters, one digit, one lower case and one upper case.');
                done();
            });
        });

        it('TC-201-4 When an user already exists, a valid error should be returned',(done) => {
            chai
            .request(server)
            .post('/api/user')
            .send({
                firstName: "Rik",
                lastName: "Vandermullen",
                street: "Kromme Slagen 3",
                city: "Breda",
                emailAdress: "rik@server.com",
                password: "Secrets0",
                phoneNumber: "06 12345678"
            })
            .end((err, res) => {
                res.should.be.an('object');
                let {status, result} = res.body;
                status.should.equals(409);
                result.should.be.an('string').that.equals('User with email: rik@server.com already exists.');
                done();
            });
        });

        it('TC-201-5 Register a new user',(done) => {
            chai
            .request(server)
            .post('/api/user')
            .send({
                firstName: "Other Rik",
                lastName: "Vandermullen",
                street: "Kromme Slagen 3",
                city: "Breda",
                emailAdress: "otherrik@server.com",
                password: "Secrets0",
                phoneNumber: "06 12345678"
            })
            .end((err, res) => {
                res.should.be.an('object');
                let {status, result} = res.body;
                status.should.equals(201);
                let expected = [{
                    id: 3,
                    firstName: "Other Rik",
                    lastName: "Vandermullen",
                    isActive: 1, 
                    emailAdress: "otherrik@server.com",
                    password: "Secrets0",
                    phoneNumber: "06 12345678",
                    roles: 'editor,guest',
                    street: "Kromme Slagen 3",
                    city: "Breda"
                }]
                assert.deepEqual(result,expected);
                done();
            });
        });
    });

    describe('UC-202 Retrieve users /api/user',() => {
        beforeEach((done) => {
            console.log('beforeEach called');
            dbconnection.getConnection(function (err, connection) {
                if (err) throw err // not connected!
                connection.query(CLEAR_USERS_TABLE, function (error, results, fields) {
                    // resets auto increment to 1
                    connection.query('ALTER TABLE user AUTO_INCREMENT = 1;', (error, result, field) => {
                        connection.query(INSERT_USER, (error, result, field) => {
                            connection.release()
                            if (error) throw error;
                            console.log('beforeEach done');
                            done();
                        })
                    })
                })
            })
        });

        it('TC-202-1 Show zero users /api/user&active=0',(done) => {
            chai
            .request(server)
            .get('/api/user?active=0')
            .end((err, res) => {
                res.should.be.an('object');
                let {status, result} = res.body;
                status.should.equals(200);
                // all users are active so array length should be 0
                result.should.be.an('array').that.lengthOf(0);
                done();
            });
        });

        it('TC-202-2 Show two users /api/user',(done) => {
            chai
            .request(server)
            .get('/api/user')
            .end((err, res) => {
                res.should.be.an('object');
                let {status, result} = res.body;
                status.should.equals(200);
                result.should.be.an('array').that.lengthOf(2);
                done();
            });
        });

        it('TC-202-3 Show users with non existing query name /api/user?name=piet',(done) => {
            chai
            .request(server)
            .get('/api/user?name=piet')
            .end((err, res) => {
                res.should.be.an('object');
                let {status, result} = res.body;
                status.should.equals(200);
                result.should.be.an('array').that.lengthOf(0);
                done();
            });
        });

        it('TC-202-4 Show users with query active = false /api/user?active=false',(done) => {
            chai
            .request(server)
            .get('/api/user?active=false')
            .end((err, res) => {
                res.should.be.an('object');
                let {status, result} = res.body;
                status.should.equals(200);
                // all users are active so array length should be 0
                result.should.be.an('array').that.lengthOf(0);
                done();
            });
        });

        it('TC-202-4 Show users with query active = true /api/user?active=true',(done) => {
            chai
            .request(server)
            .get('/api/user?active=true')
            .end((err, res) => {
                res.should.be.an('object');
                let {status, result} = res.body;
                status.should.equals(200);
                // all users are active so array length should be 2
                result.should.be.an('array').that.lengthOf(2);
                done();
            });
        });

        it('TC-202-5 Show users with query name = Rik /api/user?name=Rik',(done) => {
            chai
            .request(server)
            .get('/api/user?name=Rik')
            .end((err, res) => {
                res.should.be.an('object');
                let {status, result} = res.body;
                status.should.equals(200);
                // only 1 user has the first name Rik so array length should be 1
                result.should.be.an('array').that.lengthOf(1);
                done();
            });
        });
    });

    describe('UC-204 Retrieve user details /api/user/:userId',() => {
        beforeEach((done) => {
            console.log('beforeEach called');
            dbconnection.getConnection(function (err, connection) {
                if (err) throw err // not connected!
                connection.query(CLEAR_USERS_TABLE, function (error, results, fields) {
                    // resets auto increment to 1
                    connection.query('ALTER TABLE user AUTO_INCREMENT = 1;', (error, result, field) => {
                        connection.query(INSERT_USER, (error, result, field) => {
                            connection.release()
                            if (error) throw error;
                            console.log('beforeEach done');
                            done();
                        })
                    })
                })
            })
        });

        it('TC-204-1 Invalid token is provided /api/user/1',(done) => {
            // not implemented yet.
            done();
        });

        it('TC-204-2 user id does not exist /api/user/5',(done) => {
            chai
            .request(server)
            .get('/api/user/5')
            .end((err, res) => {
                res.should.be.an('object');
                let {status, result} = res.body;
                status.should.equals(404);
                result.should.be.an('string').that.equals("User with ID 5 not found");
                done();
            });
        });

        it('TC-204-3 user id does exist /api/user/1',(done) => {
            chai
            .request(server)
            .get('/api/user/1')
            .end((err, res) => {
                res.should.be.an('object');
                let {status, result} = res.body;
                status.should.equals(200);
                let expected = [{
                    id: 1,
                    firstName: "Rik",
                    lastName: "Vandermullen",
                    isActive: 1, 
                    emailAdress: "rik@server.com",
                    password: "Secrets0",
                    phoneNumber: "06 12345678",
                    roles: 'editor,guest',
                    street: "Kromme Slagen 3",
                    city: "Breda"
                }]
                assert.deepEqual(result,expected);
                done();
            });
        });
    });

    describe('UC-205 Update user details /api/user/:userId',() => {
        beforeEach((done) => {
            console.log('beforeEach called');
            dbconnection.getConnection(function (err, connection) {
                if (err) throw err // not connected!
                connection.query(CLEAR_USERS_TABLE, function (error, results, fields) {
                    // resets auto increment to 1
                    connection.query('ALTER TABLE user AUTO_INCREMENT = 1;', (error, result, field) => {
                        connection.query(INSERT_USER, (error, result, field) => {
                            connection.release()
                            if (error) throw error;
                            console.log('beforeEach done');
                            done();
                        })
                    })
                })
            })
        });

        it('TC-205-1 Required field is missing, a valid error message is returned /api/user/1',(done) => {
            chai
            .request(server)
            .put('/api/user/1')
            .send({
                // firstName is missing
                lastName: "Vandermullen",
                street: "Kromme Slagen 3",
                city: "Breda",
                emailAdress: "rik@server.com",
                password: "Secrets0",
                phoneNumber: "06 12345678"
            })
            .end((err, res) => {
                res.should.be.an('object');
                let {status, result} = res.body;
                status.should.equals(400);
                result.should.be.an('string').that.equals("First name must be a string");
                done();
            });
        });

        it('TC-205-2 An invalid postalCode is provided, a valid error message is returned /api/user/1',(done) => {
            // not implemented yet.
            done();
        });

        it('TC-205-3 An invalid phoneNumber is provided, a valid error message is returned /api/user/1',(done) => {
            chai
            .request(server)
            .put('/api/user/1')
            .send({
                firstName: "Rik",
                lastName: "Vandermullen",
                street: "Kromme Slagen 3",
                city: "Breda",
                emailAdress: "rik@server.com",
                password: "Secrets0",
                phoneNumber: "06 12345"
            })
            .end((err, res) => {
                res.should.be.an('object');
                let {status, result} = res.body;
                status.should.equals(400);
                result.should.be.an('string').that.equals("This phone number is invalid, please use this format 06 12345678.");
                done();
            });
        });

        it('TC-205-4 user id does not exist /api/user/5',(done) => {
            chai
            .request(server)
            .put('/api/user/5')
            .send({
                firstName: "Rik",
                lastName: "Vandermullen",
                isActive: 0,
                street: "Kromme Slagen 3",
                // Changed Breda to Amsterdam
                city: "Amsterdam",
                emailAdress: "rik@server.com",
                password: "Secrets0",
                phoneNumber: "06 12345678"
            })
            .end((err, res) => {
                res.should.be.an('object');
                let {status, result} = res.body;
                status.should.equals(400);
                result.should.be.an('string').that.equals("User with ID 5 not updated because it was not found.");
                done();
            });
        });

        it('TC-205-5 user is not logged in /api/user/1',(done) => {
            // not yet implemented
            done();
        });

        it('TC-205-6 User information has been updated /api/user/1',(done) => {
            chai
            .request(server)
            .put('/api/user/1')
            .send({
                firstName: "Rik",
                lastName: "Vandermullen",
                street: "Kromme Slagen 3",
                isActive: 1,
                // Changed Breda to Amsterdam
                city: "Amsterdam",
                emailAdress: "rik@server.com",
                password: "Secrets0",
                phoneNumber: "06 12345678"
            })
            .end((err, res) => {
                res.should.be.an('object');
                let {status, result} = res.body;
                status.should.equals(200);
                let expected = [{
                    id: 1,
                    firstName: "Rik",
                    lastName: "Vandermullen",
                    isActive: 1, 
                    emailAdress: "rik@server.com",
                    password: "Secrets0",
                    phoneNumber: "06 12345678",
                    roles: 'editor,guest',
                    street: "Kromme Slagen 3",
                    city: "Amsterdam"
                }]
                assert.deepEqual(result,expected);
                done();
            });
        });
    });

    describe('UC-206 Delete user /api/user/:userId',() => {
        beforeEach((done) => {
            console.log('beforeEach called');
            dbconnection.getConnection(function (err, connection) {
                if (err) throw err // not connected!
                connection.query(CLEAR_USERS_TABLE, function (error, results, fields) {
                    // resets auto increment to 1
                    connection.query('ALTER TABLE user AUTO_INCREMENT = 1;', (error, result, field) => {
                        connection.query(INSERT_USER, (error, result, field) => {
                            connection.release()
                            if (error) throw error;
                            console.log('beforeEach done');
                            done();
                        })
                    })
                })
            })
        });

        it('TC-206-1 User id does not exist, a valid error message is returned /api/user/5',(done) => {
            chai
            .request(server)
            .delete('/api/user/5')
            .end((err, res) => {
                res.should.be.an('object');
                let {status, result} = res.body;
                status.should.equals(400);
                result.should.be.an('string').that.equals("User with ID 5 was not found and not deleted");
                done();
            });
        });

        it('TC-206-2 User is not logged in /api/user/1',(done) => {
            // not implemented yet.
            done();
        });

        it('TC-206-3 User is not an owner /api/user/1',(done) => {
            // not implemented yet.
            done();
        });

        it('TC-206-4 User has been deleted /api/user/2',(done) => {
            chai
            .request(server)
            .delete('/api/user/2')
            .end((err, res) => {
                res.should.be.an('object');
                let {status, result} = res.body;
                status.should.equals(200);
                result.should.be.an('string').that.equals("User with ID 2 is deleted");
                done();
            });
        });
    });
});