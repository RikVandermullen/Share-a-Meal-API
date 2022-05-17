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
            connection.query('INSERT INTO meal (datetime, maxAmountOfParticipants, price, imageUrl, cookId, name, description, isActive, isVega, isVegan, isToTakeHome) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);', [meal.datetime, meal.maxAmountOfParticipants, meal.price, meal.imageUrl, cookId, meal.name, meal.description, meal.isActive, meal.isVega, meal.isVegan, meal.isToTakeHome], function (error, results, fields) {
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
        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!

            // retrieves all users
            connection.query('SELECT * FROM meal;', function (error, results, fields) {
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
    updateMeal: (req, res, next) => {
        const mealId = req.params.mealId;
        const newMealInfo = req.body;
        
        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!

            // updates a meal based on id parameter
            connection.query('UPDATE meal SET name = ?, description = ?, isActive = ?, isVega = ?, isVegan = ?, isToTakeHome = ?, datetime = ?, imageUrl = ?, allergenes = ?, maxAmountOfParticipants = ?, price = ? WHERE id = ?;', [newMealInfo.name, newMealInfo.description, newMealInfo.isActive, newMealInfo.isVega, newMealInfo.isVegan, newMealInfo.isToTakeHome, newMealInfo.datetime, newMealInfo.imageUrl, newMealInfo.allergenes, newMealInfo.maxAmountOfParticipants, newMealInfo.price, mealId], function (error, results, fields) {
                if (error) {
                    console.log(error)
                    connection.release();
                    const newError = {
                        status: 400,
                        message: `A meal with id ${mealId} does not exist.`
                    }
                    next(newError);
                } else {
                    // checks if a row is affected (updated)
                    if (results.affectedRows > 0) {
                        if (err) throw err; // not connected!

                        // gets meal for the response if a row is changed
                        connection.query('SELECT * FROM meal WHERE id = ?;',[mealId], function (error, results, fields) {
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
                            message: `Meal with ID ${mealId} not updated because it was not found.`,
                        }
                        next(error);
                    }
                }
            });
        });
    },
    deleteMeal: (req, res, next) => {
        const mealId = req.params.mealId;
        
        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!

            // deletes user based on id parameter
            connection.query('DELETE FROM meal WHERE id = ?;',[mealId], function (error, results, fields) {
                connection.release();
                if (error) throw error
                
                // checks if a row is affected (deleted)
                if (results.affectedRows > 0) {
                    res.status(200).json({
                        status: 200,
                        message: `User with ID ${mealId} is deleted`,
                    });
                } else {
                    const error = {
                        status: 400,
                        message: `Meal does not exist`
                    }
                    next(error);
                }
            });
        });
    },
}

module.exports = controller;