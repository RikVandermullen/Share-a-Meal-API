const assert = require('assert');
let database = [];
let id = 0;

let controller = {
    validateUser: (req, res, next) => {
        let user = req.body;
        let {emailAdress, password, firstName, lastName} = user;
        try {
            assert(typeof emailAdress === 'string', 'Emailaddress must be a string');
            assert(typeof password === 'string', 'Password must be a string');
            assert(typeof firstName === 'string', 'First name must be a string');
            assert(typeof lastName === 'string', 'Last name must be a string');
            next();
        } catch (err) {
            const error = {
                status: 400,
                result: err.message,
            };
            
            next(error);
        }
    },
    addUser: (req, res, next) => {
        let user = req.body;
        id++;
        user = {
            id,
            ...user,
        };
        let email = database.filter((item) => item.emailAdress == user.emailAdress);
        if (email.length == 0) {
            database.push(user);
            res.status(201).json({
                status: 201,
                result: user,
            });
        } else {
            const error = {
                status: 401,
                result: `User with email ${user.emailAdress} already exists`
            }
            next(error);
        }
    },
    getAllUsers: (req, res) => {
        res.status(200).json({
            status: 200,
            result: database,
        });
    },
    updateUser: (req, res, next) => {
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
            const error = {
                status: 401,
                result: `User with ID ${id} was not found and not updated`
            }
            next(error);
        }
    },
    deleteUser: (req, res, next) => {
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
            const error = {
                status: 401,
                result: `User with ID ${id} was not found and not deleted`
            }
            next(error);
        }
    },
    getUserById: (req, res, next) => {
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
            const error = {
                status: 401,
                result: `User with ID ${userId} not found`,
            }
            next(error);
        }
    },
    getUserProfile: (req, res, next) => {
        const error = {
            status: 401,
            result: "This functionality has not yet been implemented" 
        }
        next(error);
    }
}
module.exports = controller;