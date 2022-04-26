const express = require('express');
const controller = require('../controllers/user.controller');
const router = express.Router();
const userController = require('../controllers/user.controller')

router.get("/", (req, res) => {
    res.status(200).json({
      status: 200,
      result: "Hello World",
    });
  });

//Adds new User to database if emailaddress is unqiue
router.post("/api/user", userController.addUser);
  
//Retrieves User profile (not implemented)
router.get("/api/user/profile", userController.getUserProfile);
  
//Retrieves User info based on id paramater
router.get("/api/user/:userId", controller.getUserById);
  
//Updates User info based on id paramater
router.put("/api/user/:userId", controller.updateUser);
  
//Deletes User based on id paramater
router.delete("/api/user/:userId", controller.deleteUser);
  
//Retrieves all Users info
router.get("/api/user", controller.getAllUsers);

module.exports = router;