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

app.post("/api/user", (req, res) => {
  let user = req.body;
  id++;
  user = {
    id,
    ...user,
  };
  console.log(user);
  database.push(user);
  res.status(201).json({
    status: 201,
    result: database,
  });
});

app.get("/api/user/:userId", (req, res, next) => {
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

app.put("/api/user/:userId", (req, res, next) => {
  const id = req.params.userId;
  const updateUser = req.body;
  database.forEach((u, index) => {
    if (u.id == id) {
      user = {
        id,
        ...updateUser,
      };
      database[index] = user;
      res.status(201).json({
        status: 201,
        result: user,
      });
    } else {
      res.status(401).json({
        status: 401,
        result: `User with ID ${id} not updated`,
      });
    }
  })
})

app.delete("/api/user/:userId", (req, res, next) => {
  const id = req.params.userId;
  database.forEach((u, index) => {
    if (u.id == id) {
      database.splice(index, 1);
      res.status(200).json({
        status: 200,
        result: `User with ID ${id} is deleted`,
      });
    } else {
      res.status(401).json({
        status: 401,
        result: `User with ID ${id} is not deleted`,
      });
  }
})
})

app.get("/api/user", (req, res, next) => {
  res.status(200).json({
    status: 200,
    result: database,
  });
});

app.all("*", (req, res) => {
  res.status(401).json({
    status: 401,
    result: "End-point not found",
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
