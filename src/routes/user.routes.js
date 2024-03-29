const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller')
const authController = require('../controllers/auth.controller')

router.get("/", (req, res) => {
    res.status(200).json({
      status: 200,
      result: "Hello World!",
    });
  });

//Adds new User to database if emailaddress is unqiue
router.post("/api/user", userController.validateUser, userController.addUser);
  
//Retrieves User profile (not implemented)
router.get("/api/user/profile", authController.validateToken, userController.getUserProfile);
  
//Retrieves User info based on id paramater
router.get("/api/user/:userId", authController.validateToken, userController.getUserById);
  
//Updates User info based on id paramater
router.put("/api/user/:userId", authController.validateToken, userController.validateUser ,userController.updateUser);
  
//Deletes User based on id paramater
router.delete("/api/user/:userId", authController.validateToken, authController.validateUserOwner, userController.deleteUser);
  
//Retrieves all Users info
router.get("/api/user", authController.validateToken, userController.getAllUsers);

module.exports = router;