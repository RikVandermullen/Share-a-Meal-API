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

describe('Manage meals',() => {
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

    describe('UC-301 Register new meal /api/meal',() => {
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

        it('TC-301-1 When a required input is missing, a valid error should be returned',(done) => {
            chai
            .request(server)
            .post('/api/meal')
            .set(
                'authorization',
                'Bearer ' + jwt.sign({ userId: 1 }, process.env.JWT_SECRET)
            )
            .send({
                // name is missing
                description : "this is an test meal",
                isActive : 1,
                isVega : 0,
                isVegan : 0,
                isToTakeHome : 1,
                datetime : "2022-03-20 12:01:05",
                imageUrl : "https://google.com",
                allergenes : ["noten"],
                maxAmountOfParticipants : 1,
                price : 15.99 
            })
            .end((err, res) => {
                res.should.be.an('object');
                let {status, message} = res.body;
                status.should.equals(400);
                message.should.be.an('string').that.equals('Name must be a string');
                done();
            });
        });

        it('TC-301-2 When a user is not logged in, a valid error should be returned',(done) => {
            chai
            .request(server)
            .post('/api/meal')
            .send({
                name : "Test Meal",
                description : "this is a test meal",
                isActive : 1,
                isVega : 0,
                isVegan : 0,
                isToTakeHome : 1,
                datetime : "2022-03-20 12:01:05",
                imageUrl : "https://google.com",
                allergenes : ["noten"],
                maxAmountOfParticipants : 1,
                price : 15.99 
            })
            .end((err, res) => {
                console.log(res.body)
                res.should.be.an('object');
                let {status, message} = res.body;
                status.should.equals(401);
                message.should.be.an('string').that.equals('Authorization header missing!');
                done();
            });
        });

        it('TC-301-3 A new meal has been created',(done) => {
            chai
            .request(server)
            .post('/api/meal')
            .set(
                'authorization',
                'Bearer ' + jwt.sign({ userId: 1 }, process.env.JWT_SECRET)
            )
            .send({
                name : "Test Meal",
                description : "this is a test meal",
                isActive : 1,
                isVega : 0,
                isVegan : 0,
                isToTakeHome : 1,
                datetime : "2022-03-20T12:01:05.000Z",
                imageUrl : "https://google.com/meal",
                allergenes : ["noten"],
                maxAmountOfParticipants : 1,
                price : 15.99 
            })
            .end((err, res) => {
                res.should.be.an('object');
                let {status, result} = res.body;
                status.should.equals(201);
                //createDate and updateDate are token from result body
                let expected = {
                    allergenes : "noten",
                    cookId: 1,
                    createDate: result.createDate,
                    dateTime: result.dateTime,
                    description : "this is a test meal",
                    id: 3,
                    imageUrl : "https://google.com/meal",
                    isActive : true,
                    isToTakeHome : true,
                    isVega : false,
                    isVegan : false,
                    maxAmountOfParticipants : 1,
                    name : "Test Meal",
                    price : 15.99,
                    updateDate: result.updateDate
                }
                assert.deepEqual(result,expected);
                done();
            });
        });
    })

    describe('UC-302 Update a meal /api/meal/:mealId',() => {
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

        it('TC-302-1 When a required input is missing, a valid error should be returned',(done) => {
            chai
            .request(server)
            .put('/api/meal/2')
            .set(
                'authorization',
                'Bearer ' + jwt.sign({ userId: 1 }, process.env.JWT_SECRET)
            )
            .send({
                // name is missing
                description : "this is a test meal",
                isActive : 1,
                isVega : 0,
                isVegan : 0,
                isToTakeHome : 1,
                datetime : "2022-03-20 12:01:05",
                imageUrl : "https://google.com/meal",
                allergenes : ["noten"],
                maxAmountOfParticipants : 1,
                price : 15.99 
            })
            .end((err, res) => {
                res.should.be.an('object');
                let {status, message} = res.body;
                status.should.equals(400);
                message.should.be.an('string').that.equals('Name must be a string');
                done();
            });
        });

        it('TC-302-2 User is not logged in when updating a meal',(done) => {
            chai
            .request(server)
            .put('/api/meal/2')
            .send({
                name: "Awesome meal",
                description : "this is a test meal",
                isActive : 1,
                isVega : 0,
                isVegan : 0,
                isToTakeHome : 1,
                datetime : "2022-03-20 12:01:05",
                imageUrl : "https://google.com/meal",
                allergenes : ["noten"],
                maxAmountOfParticipants : 1,
                price : 15.99 
            })
            .end((err, res) => {
                res.should.be.an('object');
                let {status, message} = res.body;
                status.should.equals(401);
                message.should.be.an('string').that.equals('Authorization header missing!');
                done();
            });
        });

        it('TC-302-3 Logged in user is not the owner of the meal when updating',(done) => {
            chai
            .request(server)
            .put('/api/meal/2')
            .set(
                'authorization',
                'Bearer ' + jwt.sign({ userId: 2 }, process.env.JWT_SECRET)
            )
            .send({
                name: "Awesome meal",
                description : "this is a test meal",
                isActive : 1,
                isVega : 0,
                isVegan : 0,
                isToTakeHome : 1,
                datetime : "2022-03-20 12:01:05",
                imageUrl : "https://google.com/meal",
                allergenes : ["noten"],
                maxAmountOfParticipants : 1,
                price : 15.99 
            })
            .end((err, res) => {
                res.should.be.an('object');
                let {status, message} = res.body;
                status.should.equals(403);
                message.should.be.an('string').that.equals('The user: 2 is not the owner of meal: 2.');
                done();
            });
        });

        it('TC-302-4 Logged in user updates meal that does not exist',(done) => {
            chai
            .request(server)
            .put('/api/meal/3')
            .set(
                'authorization',
                'Bearer ' + jwt.sign({ userId: 1 }, process.env.JWT_SECRET)
            )
            .send({
                name: "Awesome meal",
                description : "this is a test meal",
                isActive : 1,
                isVega : 0,
                isVegan : 0,
                isToTakeHome : 1,
                datetime : "2022-03-20 12:01:05",
                imageUrl : "https://google.com/meal",
                allergenes : ["noten"],
                maxAmountOfParticipants : 1,
                price : 15.99 
            })
            .end((err, res) => {
                res.should.be.an('object');
                let {status, message} = res.body;
                status.should.equals(404);
                message.should.be.an('string').that.equals('The meal: 3 does not exist.');
                done();
            });
        });

        it('TC-302-5 Logged in user updates meal that does exist',(done) => {
            chai
            .request(server)
            .put('/api/meal/2')
            .set(
                'authorization',
                'Bearer ' + jwt.sign({ userId: 1 }, process.env.JWT_SECRET)
            )
            .send({
                name: "Awesome meal",
                description : "this is a test meal",
                isActive : 1,
                isVega : 0,
                isVegan : 0,
                isToTakeHome : 1,
                datetime : "2022-03-20 12:01:05",
                imageUrl : "https://google.com/meal",
                allergenes : ["noten"],
                maxAmountOfParticipants : 1,
                price : 15.99 
            })
            .end((err, res) => {
                res.should.be.an('object');
                let {status, result} = res.body;
                status.should.equals(200);
                let expected = {
                    allergenes : "noten",
                    cookId: 1,
                    createDate: result.createDate,
                    dateTime: result.dateTime,
                    description : "this is a test meal",
                    id: 2,
                    imageUrl : "https://google.com/meal",
                    isActive : 1,
                    isToTakeHome : 1,
                    isVega : 0,
                    isVegan : 0,
                    maxAmountOfParticipants : 1,
                    name : "Awesome meal",
                    price : "15.99",
                    updateDate: result.updateDate
                }
                assert.deepEqual(result,expected);
                done();
            });
        });
    })

    describe('UC-303 Retrieve all meals /api/meal/',() => {
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

        it('TC-303-1 A list of meals is returned when requested',(done) => {
            chai
            .request(server)
            .get('/api/meal')
            .end((err, res) => {
                res.should.be.an('object');
                let {status, result} = res.body;
                status.should.equals(200);
                result.should.be.an('array').that.lengthOf(2);
                done();
            });
        });
    })

    describe('UC-304 Retrieve a meals based on mealId parameter /api/meal/:mealId',() => {
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

        it('TC-304-1 A requested meal that does not exist',(done) => {
            chai
            .request(server)
            .get('/api/meal/3')
            .end((err, res) => {
                res.should.be.an('object');
                let {status, message} = res.body;
                status.should.equals(404);
                message.should.be.an('string').that.equals('Meal with ID 3 not found');
                done();
            });
        });

        it('TC-304-2 A requested meal that does exist',(done) => {
            chai
            .request(server)
            .get('/api/meal/2')
            .end((err, res) => {
                res.should.be.an('object');
                let {status, result} = res.body;
                status.should.equals(200);
                let expected = {
                    allergenes : "",
                    cookId: 1,
                    createDate: result.createDate,
                    dateTime: result.dateTime,
                    description : "description",
                    id: 2,
                    imageUrl : "image url",
                    isActive : 0,
                    isToTakeHome : 1,
                    isVega : 0,
                    isVegan : 0,
                    maxAmountOfParticipants : 5,
                    name : "Meal B",
                    price : "6.50",
                    updateDate: result.updateDate
                }
                assert.deepEqual(result,expected);
                done();
            });
        });
    })

    describe('UC-305 Delete a meals based on mealId parameter /api/meal/:mealId',() => {
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

        it('TC-304-1 Deleting a meal when not logged in',(done) => {
            chai
            .request(server)
            .delete('/api/meal/2')
            .end((err, res) => {
                res.should.be.an('object');
                let {status, message} = res.body;
                status.should.equals(401);
                message.should.be.an('string').that.equals('Authorization header missing!');
                done();
            });
        });

        it('TC-304-2 Deleting a meal when logged in user is not the owner',(done) => {
            chai
            .request(server)
            .delete('/api/meal/2')
            .set(
                'authorization',
                'Bearer ' + jwt.sign({ userId: 2 }, process.env.JWT_SECRET)
            )
            .end((err, res) => {
                res.should.be.an('object');
                let {status, message} = res.body;
                status.should.equals(403);
                message.should.be.an('string').that.equals('The user: 2 is not the owner of meal: 2.');
                done();
            });
        });

        it('TC-304-3 Deleting a meal that does not exist',(done) => {
            chai
            .request(server)
            .delete('/api/meal/3')
            .set(
                'authorization',
                'Bearer ' + jwt.sign({ userId: 2 }, process.env.JWT_SECRET)
            )
            .end((err, res) => {
                res.should.be.an('object');
                let {status, message} = res.body;
                status.should.equals(404);
                message.should.be.an('string').that.equals('The meal: 3 does not exist.');
                done();
            });
        });

        it('TC-304-4 Deleting a meal succesfully',(done) => {
            chai
            .request(server)
            .delete('/api/meal/2')
            .set(
                'authorization',
                'Bearer ' + jwt.sign({ userId: 1 }, process.env.JWT_SECRET)
            )
            .end((err, res) => {
                res.should.be.an('object');
                let {status, message} = res.body;
                status.should.equals(200);
                message.should.be.an('string').that.equals('Meal with ID 2 is deleted');
                done();
            });
        });
    })
})