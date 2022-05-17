const express = require('express');
const router = express.Router();
const mealController = require('../controllers/meal.controller')
const authController = require('../controllers/auth.controller')

router.get("/", (req, res) => {
    res.status(200).json({
      status: 200,
      result: "Hello World!",
    });
  });

//Adds new Meal to database if emailaddress is unqiue
router.post("/api/meal", authController.validateToken, mealController.addMeal);

//Retrieves all Meals info
router.get("/api/meal", mealController.getAllMeals);

//Retrieves Meal info based on id paramater
router.get("/api/meal/:mealId", mealController.getMealById);

module.exports = router;