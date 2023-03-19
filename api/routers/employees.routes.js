const express = require('express');
const passport = require('passport');

const {
    logEmployee, 
    createEmployee,
    deleteEmployee
} =  require('../controllers/employees.controller');

const router = express.Router();

router.post('/login', logEmployee);

//Apply auth middlewares
router.use(passport.authenticate(['jwt'], {session: false}));

router.post('/', createEmployee);
router.delete('/:id', deleteEmployee)

module.exports = { employeeRouter: router };