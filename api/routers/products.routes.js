const express = require('express');
const passport = require('passport');

const {
    addProducts,
    getProducts,
    editProduct,
    deleteProduct
} = require('../controllers/products.controller');

const router = express.Router();

//Apply use of middlewares
router.use(passport.authenticate(['jwt'], {session: false}));

router
    .route('/')
    .get(getProducts)
    .post(addProducts)

router  
    .route('/:code')
    .patch(editProduct)
    .delete(deleteProduct)

module.exports = { productRouter: router };