const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const bodyParser = require("body-parser");
app.use(bodyParser.json());

let database = [];
let id = 0;

app.all("*", (req, res, next) => {
  const method = req.method;
  console.log(`Method ${method} is aangeroepen`);
  next();
});

app.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    result: "Hello World",
  });
});

//Adds new User to database if emailaddress is unqiue
app.post("/api/user", (req, res) => {
  let user = req.body;
  id++;
  user = {
    id,
    ...user,
  };
  let email = database.filter((item) => item.emailAdress == user.emailAdress);
  if (email == 0) {
    database.push(user);
    res.status(201).json({
      status: 201,
      result: user,
    });
  } else {
    res.status(401).json({
      status: 401,
      result: `User with email ${user.emailAdress} already exists`,
    });
  }
});

//Retrieves User profile (not implemented)
app.get("/api/user/profile", (req, res) => {
  res.status(401).json({
    status: 401,
    result: "This functionality has not yet been implemented",
  });
});

//Retrieves User info based on id paramater
app.get("/api/user/:userId", (req, res) => {
  const userId = req.params.userId;
  console.log(`User met ID ${userId} gezocht`);
  let user = database.filter((item) => item.id == userId);
  if (user.length > 0) {
    console.log(user);
    res.status(200).json({
      status: 200,
      result: user,
    });
  } else {
    res.status(401).json({
      status: 401,
      result: `User with ID ${userId} not found`,
    });
  }
});

//Updates User info based on id paramater
app.put("/api/user/:userId", (req, res) => {
  const id = req.params.userId;
  const newUserInfo = req.body;
  let userArray = database.filter((item) => item.id == id);
  if (userArray.length > 0) {
    let foundUser = userArray[0];
    let index = database.indexOf(foundUser);
    user = {
        id,
        ...newUserInfo,
      };
    database[index] = user;
    res.status(201).json({
      status: 201,
      result: user,
    });
  } else {
    res.status(401).json({
      status: 401,
      result: `User with ID ${id} was not found and not updated`,
    });
  }
});

//Deletes User based on id paramater
app.delete("/api/user/:userId", (req, res) => {
  const id = req.params.userId;
  let userArray = database.filter((item) => item.id == id);
  if (userArray.length > 0) {
    let foundUser = userArray[0];
    let index = database.indexOf(foundUser);
    database.splice(index, 1);
    res.status(200).json({
      status: 200,
      result: `User with ID ${id} is deleted`,
    });
  } else {
    res.status(401).json({
      status: 401,
      result: `User with ID ${id} was not found and not deleted`,
    });
  }
});

//Retrieves all Users info
app.get("/api/user", (req, res) => {
  res.status(200).json({
    status: 200,
    result: database,
  });
});

//Return error for incorrect routes
app.all("*", (req, res) => {
  res.status(401).json({
    status: 401,
    result: "End-point not found",
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
