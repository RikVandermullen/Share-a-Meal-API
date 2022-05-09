const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller')

router.get("/", (req, res) => {
    res.status(200).json({
      status: 200,
      result: "Hello World!",
    });
  });

//Adds new User to database if emailaddress is unqiue
router.post("/api/user", userController.validateUser, userController.addUser);
  
//Retrieves User profile (not implemented)
router.get("/api/user/profile", userController.getUserProfile);
  
//Retrieves User info based on id paramater
router.get("/api/user/:userId", userController.getUserById);
  
//Updates User info based on id paramater
router.put("/api/user/:userId", userController.validateUser ,userController.updateUser);
  
//Deletes User based on id paramater
router.delete("/api/user/:userId", userController.deleteUser);
  
//Retrieves all Users info
router.get("/api/user", userController.getAllUsers);

module.exports = router;