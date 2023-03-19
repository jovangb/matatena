const express = require('express');
const passport = require('passport');

const {
    newRent, 
    getRents
} =  require('../controllers/rents.controller');

const router = express.Router();

router
    .route('/')
    .get(getRents)
    .post(newRent)

module.exports = { rentsRouter: router };