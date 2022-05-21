const assert = require('assert');
const dbconnection = require('../../database/dbconnection')
const logger = require('../config/config').logger

let controller = {
    validateUser: (req, res, next) => {
        let user = req.body;
        let {emailAdress, password, firstName, lastName, phoneNumber, street, city} = user;
        
        // validates user attributes
        try {
            assert(typeof emailAdress === 'string', 'Email address must be a string');
            assert(typeof password === 'string', 'Password must be a string');
            assert(typeof firstName === 'string', 'First name must be a string');
            assert(typeof lastName === 'string', 'Last name must be a string');
            assert(typeof street === 'string', 'First name must be a string');
            assert(typeof city === 'string', 'Last name must be a string');

            // https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
            assert.match(emailAdress, /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, "This email address is not valid, please use a different one.")
            
            // at least 8 characters, 1 digit, 1 lower case and 1 upper case
            assert.match(password, /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/, 'This password is not valid, please use at least 8 characters, one digit, one lower case and one upper case.')
            
            // 2 digits, 1 white space, 8 digits
            assert.match(phoneNumber, /(^\+[0-9]{2}|^\+[0-9]{2}\(0\)|^\(\+[0-9]{2}\)\(0\)|^00[0-9]{2}|^0)([0-9]{9}$|[0-9\-\s]{10}$)/, "This phone number is invalid, please use this format 06 12345678.")

            next();
        } catch (err) {
            const error = {
                status: 400,
                message: err.message,
            };
            
            next(error);
        }
    },
    addUser: (req, res, next) => {
        let user = req.body;
        logger.debug(user);
        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!

            // adds new user if email adddress does not already exists
            connection.query('INSERT INTO user (firstName, lastName, street, city, emailAdress, password, phoneNumber) VALUES(?, ?, ?, ?, ?, ?, ?);', [user.firstName, user.lastName, user.street, user.city, user.emailAdress, user.password, user.phoneNumber], function (error, results, fields) {
                if (error) {
                    logger.debug(error)
                    connection.release();
                    const newError = {
                        status: 409,
                        message: `User with email: ${user.emailAdress} already exists.`
                    }
                    next(newError);
                } else {
                    // retrieves newest record to return the full user with id
                    connection.query('SELECT * FROM user ORDER BY id DESC LIMIT 1;', function (error, results, fields) {
                        connection.release();
                        if (error) throw error;
                        // sets isActive on true or false based on 0 or 1
                        results[0].isActive = user.isActive ? true : false;
                        res.status(201).json({
                            status: 201,
                            result: results[0],
                        });
                    });
                }
            });
        });
    },
    getAllUsers: (req, res) => {
        let query = req.query;
        let {active, name} = query;

        // if (active == "false") {
        //     active = 0;
        // } else if (active == "true") {
        //     active = 1;
        // }

        let sqlQuery = 'SELECT * FROM user;';
        if (active != undefined && name != undefined) {
            sqlQuery = `SELECT * FROM user WHERE isActive = ${active} AND firstName = '${name}';`;
        } else if (active != undefined && name == undefined) {
            sqlQuery = `SELECT * FROM user WHERE isActive = ${active};`;
        } else if (active == undefined && name != undefined) {
            sqlQuery = `SELECT * FROM user WHERE firstName = '${name}';`;
        }

        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!

            // retrieves all users
            connection.query(sqlQuery, function (error, results, fields) {
                connection.release();
                if (error) throw error;
                logger.debug('#results = ',results.length);
                res.status(200).json({
                    status: 200,
                    result: results,
                });
            });
        });
    },
    updateUser: (req, res, next) => {
        const id = req.params.userId;
        const newUserInfo = req.body;
        
        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!

            // updates a user based on id parameter
            connection.query('UPDATE user SET firstName=?, lastName=?, isActive=?, street=?, city=?, emailAdress=?, password=?, phoneNumber=? WHERE id = ?;', [newUserInfo.firstName, newUserInfo.lastName, newUserInfo.isActive, newUserInfo.street, newUserInfo.city,newUserInfo.emailAdress, newUserInfo.password, newUserInfo.phoneNumber, id], function (error, results, fields) {
                if (error) {
                    connection.release();
                    const newError = {
                        status: 400,
                        message: `A user with ${newUserInfo.emailAdress} does not exist.`
                    }
                    next(newError);
                } else {
                    // checks if a row is affected (updated)
                    if (results.affectedRows > 0) {
                        if (err) throw err; // not connected!

                        // gets user for the response if a row is changed
                        connection.query('SELECT * FROM user WHERE id = ?;',[id], function (error, results, fields) {
                            connection.release();
                            if (error) throw error;
                            res.status(200).json({
                                status: 200,
                                message: results,
                            });
                            
                        })
                    } else {
                        const error = {
                            status: 400,
                            message: `User with ID ${id} not updated because it was not found.`,
                        }
                        next(error);
                    }
                }
            });
        });
    },
    deleteUser: (req, res, next) => {
        const id = req.params.userId;
        
        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!

            // deletes user based on id parameter
            connection.query('DELETE FROM user WHERE id = ?;',[id], function (error, results, fields) {
                connection.release();
                if (error) throw error
                
                // checks if a row is affected (deleted)
                if (results.affectedRows > 0) {
                    res.status(200).json({
                        status: 200,
                        message: `User with ID ${id} is deleted`,
                    });
                } else {
                    const error = {
                        status: 400,
                        message: `User does not exist`
                    }
                    next(error);
                }
            });
        });
    },
    getUserById: (req, res, next) => {
        dbconnection.getConnection(function(err, connection) {
            const userId = req.params.userId;
            logger.debug(`User met ID ${userId} gezocht`);

            if (err) throw err;

            // retrieves user based on id parameter
            connection.query('SELECT * FROM user WHERE id = ?;',[userId], function (error, results, fields) {
                connection.release();
                if (error) throw error;

                logger.debug('#results = ',results.length);
                if (results.length > 0) {
                    res.status(200).json({
                        status: 200,
                        result: results[0],
                    });
                } else {
                    const error = {
                        status: 404,
                        message: `User with ID ${userId} not found`,
                    }
                    next(error);
                }
            });
        });
    },
    getUserProfile: (req, res, next) => {
        dbconnection.getConnection(function(err, connection) {
            const loggedInUserId = req.userId;
            logger.debug(`User met ID ${loggedInUserId} gezocht`);

            if (err) throw err;

            // retrieves user based on id parameter
            connection.query('SELECT * FROM user WHERE id = ?;',[loggedInUserId], function (error, results, fields) {
                connection.release();
                if (error) throw error;

                logger.debug('#results = ',results.length);
                if (results.length > 0) {
                    res.status(200).json({
                        status: 200,
                        result: results[0],
                    });
                } else {
                    const error = {
                        status: 404,
                        message: `User with ID ${loggedInUserId} not found`,
                    }
                    next(error);
                }
            });
        });
    }
}

module.exports = controller;