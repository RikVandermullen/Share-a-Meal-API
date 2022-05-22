const assert = require('assert');
const dbconnection = require('../../database/dbconnection')
const logger = require('../config/config').logger

let controller = {
    validateMeal: (req, res, next) => {
        let meal = req.body;
        let {name, description, imageUrl, maxAmountOfParticipants, price, isActive, isVega, isVegan, isToTakeHome, dateTime} = meal;

        // validates meal attributes
        try {
            assert(typeof name === 'string', 'Name must be a string');
            assert(typeof description === 'string', 'Description must be a string');
            assert(typeof imageUrl === 'string', 'Image URL must be a string');
            assert(typeof maxAmountOfParticipants === 'number', 'maxAmountofParticipants must be a number');
            assert(typeof price === 'number', 'Price must be a decimal');
            assert(typeof dateTime === "string", "DateTime must be a string");

            // checking if not null
            assert(isActive != null, "isActive cannot be null");
            assert(isVega != null, "isVega cannot be null");
            assert(isVegan != null, "isVegan cannot be null");
            assert(isToTakeHome != null, "isToTakeHome cannot be null");

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

        // join allergenens together as 1 array
        let allergenes = meal.allergenes.join();

        // change meal.price into a float
        let price = parseFloat(meal.price);

        logger.debug(meal);
        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!

            // adds new meal
            // (STR_TO_DATE(?, '%Y-%m-%dT%H:%i:%s.%fZ') makes sure a correct date is given
            connection.query(`INSERT INTO meal (dateTime, maxAmountOfParticipants, price, imageUrl, cookId, name, description, isActive, isVega, isVegan, isToTakeHome, allergenes) VALUES(STR_TO_DATE(?, '%Y-%m-%dT%H:%i:%s.%fZ'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`, [meal.dateTime, meal.maxAmountOfParticipants, meal.price, meal.imageUrl, cookId, meal.name, meal.description, meal.isActive, meal.isVega, meal.isVegan, meal.isToTakeHome, allergenes], function (error, results, fields) {
                if (error) {
                    logger.debug(error)
                    connection.release();
                    const newError = {
                        status: 409,
                        message: `Meal not created.`
                    }
                    next(newError);
                } else {
                    // retrieves newest record to return the full meal with id
                    connection.query('SELECT * FROM meal ORDER BY id DESC LIMIT 1;', function (error, results, fields) {
                        connection.release();
                        if (error) throw error;

                        // change attributes for correct response
                        results[0].price = price;
                        results[0].isActive = meal.isActive ? true : false;
                        results[0].isVega = meal.isVega ? true : false;
                        results[0].isVegan = meal.isVegan ? true : false;
                        results[0].isToTakeHome = meal.isToTakeHome ? true : false;

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

            // retrieves all meals
            connection.query('SELECT * FROM meal;', function (error, results, fields) {
                connection.release();
                if (error) throw error;
                logger.debug('Total results = ', results.length);
                res.status(200).json({
                    status: 200,
                    result: results,
                });
            });
        });
    },
    getMealById: (req, res, next) => {
        dbconnection.getConnection(function(err, connection) {
            const mealId = req.params.mealId;
            logger.debug(`Meal met ID ${mealId} gezocht`);

            if (err) throw err;

            // retrieves meal based on id parameter
            connection.query('SELECT * FROM meal WHERE id = ?;',[mealId], function (error, results, fields) {
                connection.release();
                if (error) throw error;

                logger.debug('#results = ', results.length);

                if (results.length > 0) {
                    //changes price into a float and other attributes to a boolean
                    results[0].price = parseFloat(results[0].price)
                    results[0].isActive = results[0].isActive ? true : false;
                    results[0].isVega = results[0].isVega ? true : false;
                    results[0].isVegan = results[0].isVegan ? true : false;
                    results[0].isToTakeHome = results[0].isToTakeHome ? true : false;

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

        logger.info("Requesting meal update")
        // changes price into a float
        let price = parseFloat(newMealInfo.price);

        // join allergenens together as 1 array
        let allergenes = req.body.allergenes.join()
        
        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!

            // updates a meal based on id parameter
            connection.query(`UPDATE meal SET name = ?, description = ?, isActive = ?, isVega = ?, isVegan = ?, isToTakeHome = ?, dateTime = STR_TO_DATE(?, '%Y-%m-%dT%H:%i:%s.%fZ'), imageUrl = ?, allergenes = ?, maxAmountOfParticipants = ?, price = ? WHERE id = ?;`, [newMealInfo.name, newMealInfo.description, newMealInfo.isActive, newMealInfo.isVega, newMealInfo.isVegan, newMealInfo.isToTakeHome, newMealInfo.dateTime, newMealInfo.imageUrl, allergenes, newMealInfo.maxAmountOfParticipants, newMealInfo.price, mealId], function (error, results, fields) {
                if (error) {
                    connection.release();
                    logger.info("Meal update has failed")
                    const newError = {
                        status: 404,
                        message: `A meal with id ${mealId} does not exist.`
                    }
                    next(newError);
                } else {
                    // checks if a row is affected (updated)
                    if (results.affectedRows > 0) {
                        if (err) throw err; // not connected!
                        logger.info("Meal update was succesfull");
                        // gets meal for the response if a row is changed
                        connection.query('SELECT * FROM meal WHERE id = ?;',[mealId], function (error, results, fields) {
                            connection.release();
                            if (error) throw error;
                            
                            // changes attributes for a correct response
                            results[0].price = price
                            results[0].isActive = results[0].isActive ? true : false;
                            results[0].isVega = results[0].isVega ? true : false;
                            results[0].isVegan = results[0].isVegan ? true : false;
                            results[0].isToTakeHome = results[0].isToTakeHome ? true : false;

                            res.status(200).json({
                                status: 200,
                                result: results[0],
                            });
                            
                        })
                    } else {
                        logger.info("Meal update has failed")
                        const error = {
                            status: 404,
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
        logger.debug("Requested meal deletion");
        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!

            // deletes meal based on id parameter
            connection.query('DELETE FROM meal WHERE id = ?;',[mealId], function (error, results, fields) {
                connection.release();
                if (error) throw error
                
                // checks if a row is affected (deleted)
                if (results.affectedRows > 0) {
                    logger.debug("Meal has been deleted!");
                    res.status(200).json({
                        status: 200,
                        message: `Meal with ID ${mealId} is deleted`,
                    });
                } else {
                    logger.info("Meal has not been deleted!");
                    const error = {
                        status: 404,
                        message: `Meal does not exist`
                    }
                    next(error);
                }
            });
        });
    },
    participateMeal: (req, res, next) => {
        const userId = req.userId;
        const mealId = req.params.mealId;

        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!
            logger.debug("Requesting participation");
            connection.query('SELECT * FROM meal WHERE id = ?;',[mealId], function (error, mealInfo, fields) {
                if (error) throw error

                if (mealInfo.length > 0) {
                    connection.query('SELECT * FROM meal_participants_user WHERE mealId = ?;',[mealId], function (error, participationResults, fields) {
                        if (error) throw error
                        
                        // check if userId already is participating
                        let isParticipating = false;
                        logger.debug("Checking for participation");
                        for (let i = 0; i < participationResults.length; i++) {
                            if (participationResults[i].userId == userId) {
                                isParticipating = true;
                            }
                        }

                        // if user is not participating
                        if (!isParticipating) {
                            if (participationResults.length < mealInfo[0].maxAmountOfParticipants) {
                                logger.debug("Adding participation");
                                connection.query('INSERT INTO meal_participants_user (mealId, userId) VALUES(?,?);',[mealId, userId], function(error, results, fields) {
                                    if (error) throw error;
                                    connection.release();
                                    res.status(200).json({
                                        status: 200,
                                        result: {
                                            currentlyParticipating: true,
                                            currentAmountOfParticipants: participationResults.length + 1
                                        },
                                    });
                                })
                            } else {
                                const error = {
                                    status: 401,
                                    message: `There are no available participation spots.`
                                }
                                next(error);
                            }
                        } else {
                            // if user is already participating
                            logger.debug("Removing participation");
                            connection.query('DELETE FROM meal_participants_user WHERE mealId = ? AND userId = ?;',[mealId, userId], function(error, results, fields) {
                                if (error) throw error;
                                connection.release();
                                res.status(200).json({
                                    status: 200,
                                    result: {
                                        currentlyParticipating: false,
                                        currentAmountOfParticipants: participationResults.length - 1
                                    },
                                });
                            })
                        }
                        
                    });
                } else {
                    const error = {
                        status: 404,
                        message: `Meal: ${mealId} does not exist.`
                    }
                    next(error);
                }
            });
        });
    }
}

module.exports = controller;