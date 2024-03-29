const express = require("express");
const app = express();

require('dotenv').config();
const port = process.env.PORT;

const userRouter = require('./src/routes/user.routes');
const authRouter = require('./src/routes/auth.routes');
const mealRouter = require('./src/routes/meal.routes');

const bodyParser = require("body-parser");
app.use(bodyParser.json());
const logger = require('./src/config/config').logger

app.all("*", (req, res, next) => {
  const method = req.method;
  logger.debug(`Method ${method} is called`);
  next();
});

app.use(userRouter);
app.use(authRouter);
app.use(mealRouter);

//Return error for incorrect routes
app.all("*", (req, res) => {
  res.status(401).json({
    status: 401,
    result: "End-point not found",
  });
});

//Error handler
app.use((err, req, res, next) => {
  res.status(err.status).json(err)
});

app.listen(port, () => {
  logger.debug(`Share-A-Meal API listening on port: ${port}`);
});

module.exports = app;
