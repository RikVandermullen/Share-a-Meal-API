const assert = require('assert');
const dbconnection = require('../../database/dbconnection')

let controller = {
    validateUser: (req, res, next) => {
        let user = req.body;
        let {emailAdress, password, firstName, lastName} = user;
        
        // validates user attributes
        try {
            assert(typeof emailAdress === 'string', 'Email address must be a string');
            assert(typeof password === 'string', 'Password must be a string');
            assert(typeof firstName === 'string', 'First name must be a string');
            assert(typeof lastName === 'string', 'Last name must be a string');
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
                        status: 401,
                        result: `User with email: ${user.emailAdress} already exists.`
                    }
                    next(newError);
                } else {
                    // retrieves newest record to return the full user with id
                    connection.query('SELECT * FROM user ORDER BY id DESC LIMIT 1;', function (error, results, fields) {
                        connection.release();
                        if (error) throw error;
                        res.status(200).json({
                            status: 200,
                            result: results,
                        });
                    });
                }
            });
        });
    },
    getAllUsers: (req, res) => {
        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!

            // retrieves all users
            connection.query('SELECT * FROM user;', function (error, results, fields) {
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
                        status: 401,
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
                            status: 401,
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
                        status: 401,
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
                        status: 401,
                        result: `User with ID ${userId} not found`,
                    }
                    next(error);
                }
            });
        });
    },
    getUserProfile: (req, res, next) => {
        const error = {
            status: 401,
            result: "This functionality has not yet been implemented" 
        }
        next(error);
    }
}

module.exports = controller;