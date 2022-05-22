
<h1 align="center">Share-A-Meal API</h1> 
<p align="center">
  <img width="200" src="https://img.icons8.com/emoji/344/spaghetti-emoji.png" alt="Spaghetti emoji">
</p>

[![Deploy to Heroku](https://github.com/RikVandermullen/programmeren-4-shareameal/actions/workflows/main.yml/badge.svg)](https://github.com/RikVandermullen/programmeren-4-shareameal/actions/workflows/main.yml)
![Github Language](https://img.shields.io/github/languages/top/RikVandermullen/programmeren-4-shareameal?color=informational)
[![Github Issues](https://img.shields.io/github/issues/RikVandermullen/programmeren-4-shareameal?label=Issues&color=informational)](https://github.com/RikVandermullen/programmeren-4-shareameal/issues)

## Introduction
This repository is a API for making eating together easier. Users can register themselves, offer up a meal and other users can participate that meal. The API is made with NodeJS, uses MySQL as a database and is deployed on Heroku. Endpoints that need safety are secured via JWT-authentication ([jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)). The code has been thoroughly tested by running local tests, integration tests on Github and making use of an assertion tool: [Ristretto](https://ristretto-assertion-server.herokuapp.com/api/assert/t2) made by Davide Ambesi.

#### Local tests 100%
![image](https://user-images.githubusercontent.com/94074147/169689246-eab8d633-6d5f-4a04-b882-abc3265cfa34.png)

#### Integration tests on Github 100%
![image](https://user-images.githubusercontent.com/94074147/169689319-f57ebbc0-9360-4120-b2ca-4a8e4f90abd9.png)

#### Ristretto tests 100%
![image](https://user-images.githubusercontent.com/94074147/169689441-3a019e5d-ab69-4883-b1f2-f13fd3d3090a.png)

Link to deployed API: https://rikvandermullen-shareameal.herokuapp.com/

## Table of Contents
* [Introduction](#introduction)
* [Packages](#packages)
* [Installation](#installation)
* [Usage](#usage)
  * [User](#user)
  * [Meal](#meal)
* [About me](#about-me)


## Packages
There were multiple packages used for creating this API which are listed below ⬇️

#### Packages used for production:
- [ExpressJS](https://expressjs.com/)
- [MySQL2](https://www.npmjs.com/package/mysql2)
- [body-parser](https://www.npmjs.com/package/body-parser)
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
- [tracer](https://www.npmjs.com/package/tracer)
- [dotenv](https://www.npmjs.com/package/dotenv)

#### Packages used for testing:
- [chai](https://www.chaijs.com/)
- [chai-http](https://www.chaijs.com/plugins/chai-http/)
- [mocha](https://mochajs.org/)
- [nodemon](https://www.npmjs.com/package/nodemon)

## Installation

Download the code as a zip-file or fork/clone this project.

```javascript
// install npm packages (you need this to run the application)
npm install
```
To run the application locally, startup MySQL in [XAMPP](https://www.apachefriends.org/index.html).
Requests can be send by using [Postman](https://www.postman.com/).

```javascript
// to run the application locally
npm start
```

```javascript
// to run the local tests
npm test
```

Make sure the .env file is updated with your own values.

## Statistics

- ![GitHub repo size](https://img.shields.io/github/repo-size/RikVandermullen/programmeren-4-shareameal?label=Total%20Size)
- ![GitHub Downloads](https://img.shields.io/badge/Downloads-0-blue)
- ![Github Files](https://img.shields.io/badge/Files-22-blue)
- ![Github Tests](https://img.shields.io/badge/Tests-100%25%20passed%2C%200%25%20failed-blue)

## Usage
There are a lot of routes which take different body's or parameters so they are listed below ⬇️

### User
All requests for user CRUD.

#### Register
```javascript
Route: /api/user
Request: POST
Body:
    firstName: string,
    lastName: string,
    street: string,
    city: string,
    isActive: boolean,
    emailAdress: string, // valid email address
    password: string, // At least 8 characters, one digit, one lower case and one upper case.
    phoneNumber: string // any valid dutch phone number
```

#### Login
```javascript
Route: /api/auth/login
Request: POST
Body:
    emailAdres: string,
    password: string
```

#### Get all
```javascript
// must be logged in
Route: /api/user
Request: GET
Parameters: {isActive} & {firstName}
```

#### Get by id
```javascript
// must be logged in
Route: /api/user/:userId
Request: GET
Parameter: userId
```

#### Get user profile
```javascript
// must be logged in
Route: /api/user/profile
Request: GET
```

#### Update user information
```javascript
// must be logged in
Route: /api/user/:userId
Request: PUT
Parameter: userId
Body:
    firstName: string,
    lastName: string,
    street: string,
    city: string,
    isActive: boolean,
    emailAdress: string, // valid email address
    password: string, // At least 8 characters, one digit, one lower case and one upper case.
    phoneNumber: string // any valid dutch phone number
```

#### Delete user
```javascript
// must be logged in
Route: /api/user/:userId
Request: DELETE
Parameter: userId
```

### Meal
All requests for meal CRUD.

#### Register
```javascript
Route: /api/meal
Request: POST
Body:
    name: string,
    description : string,
    isActive : boolean,
    isVega : boolean,
    isVegan : boolean,
    isToTakeHome : boolean,
    dateTime: datetime,
    imageUrl : string,
    allergenes : string array,
    maxAmountOfParticipants : number,
    price : decimal
```

#### Get all
```javascript
// must be logged in
Route: /api/meal
Request: GET
```

#### Get by id
```javascript
// must be logged in
Route: /api/meal/:meaId
Request: GET
Parameter: mealId
```

#### Update
```javascript
// must be logged in
Route: /api/meal/:mealId
Request: PUT
Parameter: mealId
Body:
    name: string,
    description : string,
    isActive : boolean,
    isVega : boolean,
    isVegan : boolean,
    isToTakeHome : boolean,
    dateTime: datetime,
    imageUrl : string,
    allergenes : string array,
    maxAmountOfParticipants : number,
    price : decimal
```

#### Delete
```javascript
// must be logged in
Route: /api/meal/:meaId
Request: DELETE
Parameter: mealId
```

#### Add or delete participation
```javascript
// must be logged in
Route: /api/meal/:mealId/participate
Request: GET
Parameter: mealId
```

## About me

My name is Rik Vandermullen, 23 years old and currently studying Computer Science at Avans University of Applied Sciences.

<a href = "mailto: rik.vandermullen@gmail.com">[![Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)](rik.vandermullen@gmail.com)</a>
[![Github](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/RikVandermullen)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](-)
