
<h1 align="center">Share-A-Meal API</h1> 
<p align="center">
  <img width="200" src="https://img.icons8.com/emoji/344/spaghetti-emoji.png" alt="Spaghetti emoji">
</p>

[![Deploy to Heroku](https://github.com/RikVandermullen/programmeren-4-shareameal/actions/workflows/main.yml/badge.svg)](https://github.com/RikVandermullen/programmeren-4-shareameal/actions/workflows/main.yml)
![Github Language](https://img.shields.io/github/languages/top/RikVandermullen/programmeren-4-shareameal?color=informational)
![Github Issues](https://img.shields.io/github/issues/RikVandermullen/programmeren-4-shareameal?label=Issues&color=informational)

## Introduction
This repository is a API for making joint eating easier. Users can register themselves and offer a meal and other users can participate that meal. The API is made in JavaScript, uses MySQL as a database and is deployed on Heroku. Endpoints that need safety are secured via JWT-authentication ([jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)).

Link to API: https://rikvandermullen-shareameal.herokuapp.com/

## Table of Contents
* [Introduction](#introduction)
* [Packages](#packages)
* [Installation](#installation)
* [Usage](#usage)


## Packages
There were multiple packages used for creating this API which are listed below.

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
// install npm packages
npm install
```
To run the application locally, startup MySQL in [XAMPP](https://www.apachefriends.org/index.html). 
```javascript
// to run to application locally
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


### User
All requests for user CRUD.

#### Register
```
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
```
Route: /api/auth/login
Request: POST
Body:
    emailAdres: string,
    password: string
```

#### Get all
```
// must be logged in
Route: /api/user
Request: GET
```

#### Get by id
```
// must be logged in
Route: /api/user/:id
Request: GET
```

#### Get user profile
```
// must be logged in
Route: /api/user/profile
Request: GET
```

#### Update user information
```
// must be logged in
Route: /api/user/:id
Request: PUT
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
```
// must be logged in
Route: /api/user/:id
Request: DELETE
```

### Meal
All requests for meal CRUD

#### Register
```
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
    allergenes : array of string,
    maxAmountOfParticipants : number,
    price : decimal
```

#### Get all
```
// must be logged in
Route: /api/meal
Request: GET
```

#### Get by id
```
// must be logged in
Route: /api/meal/:id
Request: GET
```

#### Update
```
// must be logged in
Route: /api/meal/:id
Request: PUT
Body:
    name: string,
    description : string,
    isActive : boolean,
    isVega : boolean,
    isVegan : boolean,
    isToTakeHome : boolean,
    dateTime: datetime,
    imageUrl : string,
    allergenes : array of string,
    maxAmountOfParticipants : number,
    price : decimal
```

#### Delete
```
// must be logged in
Route: /api/meal/:id
Request: DELETE
```

#### Add participation
```
// must be logged in
Route: /api/meal/:id/participate
Request: GET
```

## About me

My name is Rik Vandermullen, 23 years old and currently studying Computer Science at Avans University of Applied Sciences.

![rik.vandermullen@gmail.com](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)
![https://github.com/RikVandermullen](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)
![-](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)
