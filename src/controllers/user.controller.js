const assert = require('assert');
const dbconnection = require('../../database/dbconnection')

let controller = {
    validateUser: (req, res, next) => {
        let user = req.body;
        let {emailAdress, password, firstName, lastName, phoneNumber, street, city} = user;
        
        // validates user attributes
        try {
            // https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
            assert.match(emailAdress, /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, "This email address is not valid, please use a different one.")
            
            // at least 8 characters, 1 digit, 1 lower case and 1 upper case
            assert.match(password, /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/, 'This password is not valid, please use at least 8 characters, one digit, one lower case and one upper case.')
            
            // 2 digits, 1 white space, 8 digits
            assert.match(phoneNumber, /^\(?(0)-?6(\s)([0-9]\s{0,3}){8}$/, "This phone number is invalid, please use this format 06 12345678.")

            assert(typeof emailAdress === 'string', 'Email address must be a string');
            assert(typeof password === 'string', 'Password must be a string');
            assert(typeof firstName === 'string', 'First name must be a string');
            assert(typeof lastName === 'string', 'Last name must be a string');
            assert(typeof street === 'string', 'First name must be a string');
            assert(typeof city === 'string', 'Last name must be a string');
            next();
        } catch (err) {
            const error = {
                status: 400,
                result: err.message,
            };
            
            next(error);
        }
    },
    addUser: (req, res, next) => {
        let user = req.body;
        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!

            // adds new user if emailAdress does not already exists
            connection.query(`INSERT INTO user (firstName, lastName, street, city, emailAdress, password, phoneNumber) VALUES('${user.firstName}', '${user.lastName}', '${user.street}', '${user.city}', '${user.emailAdress}', '${user.password}', '${user.phoneNumber}');`, function (error, results, fields) {
                if (error) {
                    console.log(error)
                    connection.release();
                    const newError = {
                        status: 409,
                        result: `User with email: ${user.emailAdress} already exists.`
                    }
                    next(newError);
                } else {
                    // retrieves newest record to return the full user with id
                    connection.query('SELECT * FROM user ORDER BY id DESC LIMIT 1;', function (error, results, fields) {
                        connection.release();
                        if (error) throw error;
                        res.status(201).json({
                            status: 201,
                            result: results,
                        });
                    });
                }
            });
        });
    },
    getAllUsers: (req, res) => {
        let query = req.query;
        let {active, name} = query;

        if (active == "false") {
            active = 0;
        } else if (active == "true") {
            active = 1;
        }

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
                console.log('#results = ',results.length);
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
            connection.query(`UPDATE user SET firstName = '${newUserInfo.firstName}', lastName = '${newUserInfo.lastName}', street = '${newUserInfo.street}', city = '${newUserInfo.city}', emailAdress = '${newUserInfo.emailAdress}', password = '${newUserInfo.password}', phoneNumber = '${newUserInfo.phoneNumber}' WHERE id = ${id};`, function (error, results, fields) {
                if (error) {
                    connection.release();
                    const newError = {
                        status: 400,
                        result: `A user with ${newUserInfo.emailAdress} already exists.`
                    }
                    next(newError);
                } else {
                    // checks if a row is affected (updated)
                    if (results.affectedRows > 0) {
                        if (err) throw err; // not connected!

                        // gets user for the response if a row is changed
                        connection.query(`SELECT * FROM user WHERE id = ${id};`, function (error, results, fields) {
                            connection.release();
                            if (error) throw error;
                            res.status(200).json({
                                status: 200,
                                result: results,
                            });
                            
                        })
                    } else {
                        const error = {
                            status: 400,
                            result: `User with ID ${id} not updated because it was not found.`,
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
            connection.query(`DELETE FROM user WHERE id = ${id};`, function (error, results, fields) {
                connection.release();
                if (error) throw error
                
                // checks if a row is affected (deleted)
                if (results.affectedRows > 0) {
                    res.status(200).json({
                        status: 200,
                        result: `User with ID ${id} is deleted`,
                    });
                } else {
                    const error = {
                        status: 400,
                        result: `User with ID ${id} was not found and not deleted`
                    }
                    next(error);
                }
            });
        });
    },
    getUserById: (req, res, next) => {
        dbconnection.getConnection(function(err, connection) {
            const userId = req.params.userId;
            console.log(`User met ID ${userId} gezocht`);

            if (err) throw err;

            // retrieves user based on id parameter
            connection.query(`SELECT * FROM user WHERE id = ${userId};`, function (error, results, fields) {
                connection.release();
                if (error) throw error;

                console.log('#results = ',results.length);
                if (results.length > 0) {
                    res.status(200).json({
                        status: 200,
                        result: results,
                    });
                } else {
                    const error = {
                        status: 404,
                        result: `User with ID ${userId} not found`,
                    }
                    next(error);
                }
            });
        });
    },
    getUserProfile: (req, res, next) => {
        const error = {
            status: 400,
            result: "This functionality has not yet been implemented" 
        }
        next(error);
    }
}

module.exports = controller;