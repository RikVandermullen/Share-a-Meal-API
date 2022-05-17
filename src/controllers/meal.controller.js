const assert = require('assert');
const dbconnection = require('../../database/dbconnection')
const logger = require('../config/config').logger

let controller = {
    validateMeal: (req, res, next) => {
        let meal = req.body;
        let {isActive} = meal;
        
        // validates meal attributes
        try {
            // assert(typeof emailAdress === 'string', 'Email address must be a string');
            // assert(typeof password === 'string', 'Password must be a string');
            // assert(typeof firstName === 'string', 'First name must be a string');
            // assert(typeof lastName === 'string', 'Last name must be a string');
            // assert(typeof street === 'string', 'First name must be a string');
            // assert(typeof city === 'string', 'Last name must be a string');

            next();
        } catch (err) {
            const error = {
                status: 400,
                message: err.message,
            };
            
            next(error);
        }
    },
    addMeal: (req, res, next) => {
        let meal = req.body;
        const cookId = req.userId;
        logger.debug(meal);
        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!

            // adds new meal
            connection.query('INSERT INTO meal (datetime, maxAmountOfParticipants, price, imageUrl, cookId, name, description) VALUES(?, ?, ?, ?, ?, ?, ?);', [meal.datetime, meal.maxAmountOfParticipants, meal.price, meal.imageUrl, cookId, meal.name, meal.description], function (error, results, fields) {
                if (error) {
                    logger.debug(error)
                    connection.release();
                    const newError = {
                        status: 409,
                        message: `Meal already exists.`
                    }
                    next(newError);
                } else {
                    // retrieves newest record to return the full user with id
                    connection.query('SELECT * FROM meal ORDER BY id DESC LIMIT 1;', function (error, results, fields) {
                        connection.release();
                        if (error) throw error;
                        res.status(201).json({
                            status: 201,
                            result: results[0],
                        });
                    });
                }
            });
        });
    },
    getAllMeals: (req, res) => {
        let sqlQuery = 'SELECT * FROM meal;';
        
        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!

            // retrieves all users
            connection.query(sqlQuery, function (error, results, fields) {
                connection.release();
                if (error) throw error;
                logger.debug('#results = ',results.length);
                res.status(200).json({
                    status: 200,
                    message: results,
                });
            });
        });
    },
    getMealById: (req, res, next) => {
        dbconnection.getConnection(function(err, connection) {
            const mealId = req.params.mealId;
            logger.debug(`Meal met ID ${mealId} gezocht`);

            if (err) throw err;

            // retrieves user based on id parameter
            connection.query('SELECT * FROM meal WHERE id = ?;',[mealId], function (error, results, fields) {
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
                        message: `Meal with ID ${mealId} not found`,
                    }
                    next(error);
                }
            });
        });
    },
}

module.exports = controller;