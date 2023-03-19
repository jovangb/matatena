const express = require('express');
const passport = require('passport');

const {
    newSale,
    getSales
} = require('../controllers/sales.controller');

const { newChange } = require('../controllers/changes.controller');

const router = express.Router();

//Apply use of middlewares
router.use(passport.authenticate(['jwt'], {session: false}));

router
    .route('/')
    .get(getSales)
    .post(newSale)

router.route('/change/:saleTicket').post(newChange)

module.exports = { salesRouter: router }