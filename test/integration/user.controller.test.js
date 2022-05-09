process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb'

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
const assert = require('assert')
require('dotenv').config()
const dbconnection = require('../../database/dbconnection')
let database = [];

chai.should();
chai.use(chaiHttp);

/**
 * Db queries to clear and fill the test database before each test.
 */
 const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;'
 const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;'
 const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'
 const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE
 
 /**
  * Voeg een user toe aan de database. Deze user heeft id 1.
  * Deze id kun je als foreign key gebruiken in de andere queries, bv insert studenthomes.
  */
 const INSERT_USER =
     'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
     '(1, "first", "last", "name@server.nl", "secret", "street", "city");'
 
 /**
  * Query om twee meals toe te voegen. Let op de UserId, die moet matchen
  * met de user die je ook toevoegt.
  */
 const INSERT_MEALS =
     'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
     "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
     "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);"

describe('Manage users',() => {
    describe('UC-201 Register new user /api/user',() => {
        beforeEach((done) => {
            console.log('beforeEach called')
            // clearing the test database
            dbconnection.getConnection(function (err, connection) {
                if (err) throw err // not connected!

                // Use the connection
                connection.query(CLEAR_DB, function (error, results, fields) {
                    // When done with the connection, release it.
                    connection.release()

                    // Handle error after the release.
                    if (error) throw error

                    console.log('beforeEach done')
                    done()
                })
            })
        });

        // it('TC-201-1 When a required input is missing, a valid error should be returned',(done) => {
        //     chai
        //     .request(server)
        //     .post('/api/user')
        //     .send({
        //         // emailAdres is missing
        //         firstName: "Rik",
        //         lastName: "Vandermullen",
        //         street: "Kromme Slagen 3",
        //         city: "Breda",
        //         password: "12345",
        //         phoneNumber: "06 12345678"
        //     })
        //     .end((err, res) => {
        //         res.should.be.an('object');
        //         let {status, result} = res.body;
        //         status.should.equals(400);
        //         result.should.be.an('string').that.equals('Email address must be a string');
        //         done();
        //     });
        // });
    });
});