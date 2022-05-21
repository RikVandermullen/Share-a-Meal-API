const assert = require('assert');
const dbconnection = require('../../database/dbconnection');
const jwt = require('jsonwebtoken');
const logger = require('../config/config').logger

let controller = {
    login(req, res, next) {
        dbconnection.getConnection((err, connection) => {
            if (err) {
                logger.debug('Error getting connection from dbconnection')
                const newError = {
                    status: 500,
                    message: err.toString()
                }
                next(newError);
            }
            if (connection) {
                // 1. Kijk of deze useraccount bestaat.
                connection.query(
                    'SELECT `id`, `emailAdress`, `password`, `firstName`, `lastName` FROM `user` WHERE `emailAdress` = ?',
                    [req.body.emailAdress],
                    (err, rows, fields) => {
                        connection.release()
                        if (err) {
                            logger.debug('Error: ', err.toString())
                            const newError = {
                                status: 404,
                                message: err.toString()
                            }
                            next(newError);
                        }
                        if (rows) {
                            // 2. Er was een resultaat, check het password.
                            if (
                                rows &&
                                rows.length === 1 &&
                                rows[0].password == req.body.password
                            ) {
                                logger.debug(
                                    'passwords DID match, sending userinfo and valid token'
                                )
                                // Extract the password from the userdata - we do not send that in the response.
                                const { password, ...userinfo } = rows[0]
                                // Create an object containing the data we want in the payload.
                                const payload = {
                                    userId: userinfo.id,
                                }

                                jwt.sign(
                                    payload,
                                    process.env.JWT_SECRET,
                                    { expiresIn: '12d' },
                                    function (err, token) {
                                        logger.debug(
                                            'User logged in, sending: ',
                                            userinfo
                                        )
                                        res.status(200).json({
                                            statusCode: 200,
                                            results: { ...userinfo, token },
                                        })
                                    }
                                )
                            } else {
                                logger.debug(
                                    'User not found or password invalid'
                                )
                                const newError = {
                                    status: 401,
                                    message: `User not found or password invalid`
                                }
                                next(newError);
                            }
                        }
                    }
                )
            }
        })
    },
    validateLogin(req, res, next) {
        // Verify that we receive the expected input
        try {
            assert(typeof req.body.emailAdress === 'string','email must be a string.')
            assert(typeof req.body.password === 'string','password must be a string.')

            // https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
            assert.match(emailAdress, /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, "This email address is not valid, please use a different one.")
            
            // at least 8 characters, 1 digit, 1 lower case and 1 upper case
            assert.match(password, /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/, 'This password is not valid, please use at least 8 characters, one digit, one lower case and one upper case.')
            
            next()
        } catch (ex) {
            const newError = {
                status: 400,
                message: ex.toString()
            }
            next(newError);
        }
    },
    validateToken(req, res, next) {
        logger.debug('validateToken called')
        // logger.trace(req.headers)
        // The headers should contain the authorization-field with value 'Bearer [token]'
        const authHeader = req.headers.authorization
        if (!authHeader) {
            logger.debug('Authorization header missing!')
            const newError = {
                status: 401,
                message: `Authorization header missing!`
            }
            next(newError);
        } else {
            // Strip the word 'Bearer ' from the headervalue
            const token = authHeader.substring(7, authHeader.length)

            jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
                if (err) {
                    logger.debug('Not authorized')
                    const newError = {
                        status: 401,
                        message: `Not authorized`
                    }
                    next(newError);
                }
                if (payload) {
                    logger.debug('token is valid', payload)
                    // User heeft toegang. Voeg UserId uit payload toe aan
                    // request, voor ieder volgend endpoint.
                    req.userId = payload.userId
                    next()
                }
            })
        }
    },
    validateOwner(req, res, next) {
        const mealId = req.params.mealId;
        const userId = req.userId;
        
        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!

            connection.query('SELECT cookId FROM meal WHERE id = ?;',[mealId], function (error, results, fields) {
                connection.release();
                if (error) throw error;

                let cookId;
                if (!results[0]) {
                    const newError = {
                        status: 404,
                        message: `The meal: ${mealId} does not exist.`
                    }
                    next(newError); 
                } else {
                    cookId = results[0].cookId;
                }
                
                
                // checks if logged in user is the owner of meal
                if (userId !== cookId) {
                    const newError = {
                        status: 403,
                        message: `The user: ${userId} is not the owner of meal: ${mealId}.`
                    }
                    next(newError);
                } else {
                    next();
                }
            })
        })
    }
}

module.exports = controller;