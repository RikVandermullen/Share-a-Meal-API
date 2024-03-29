const express = require('express');
const router = express.Router();
const mealController = require('../controllers/meal.controller')
const authController = require('../controllers/auth.controller')

//Adds new Meal to database if emailaddress is unqiue
router.post("/api/meal", authController.validateToken, mealController.validateMeal, mealController.addMeal);

//Retrieves all Meals info
router.get("/api/meal", mealController.getAllMeals);

//Retrieves Meal info based on id paramater
router.get("/api/meal/:mealId", mealController.getMealById);

//Updates Meal info based on id paramater
router.put("/api/meal/:mealId", authController.validateToken, authController.validateOwner, mealController.validateMeal, mealController.updateMeal);

//Deletes Meal based on id paramater
router.delete("/api/meal/:mealId", authController.validateToken, authController.validateOwner, mealController.deleteMeal);

//Route for adding or deleteing participation
router.get("/api/meal/:mealId/participate", authController.validateToken, mealController.participateMeal);

module.exports = router;