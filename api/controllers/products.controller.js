//Models
const { Product } =  require('../models/products.model');

//Utils
const catchAsync = require('../utils/catchAsync');

exports.addProducts = catchAsync(async (req, res, next) => {
    const { products } = req.body;
    const notUploadedProducts  = [];

    for (const product of products) {
        const { code, name, productType, size, quantity, price, productCategory } = product;

        if(!code || !name || !quantity || !price){
            notUploadedProducts.push(product);
            continue;
        }

        const productExists = await Product.findOne({where: {code}});
        if(productExists){
            notUploadedProducts.push(product);
            continue;
        }

        //Create the product
        await Product.create({
            code, 
            name,
            productType,
            size,
            quantity,
            price,
            productCategory
        })
    }

    res.status(200).json({
        status: 'success',
        data: { notUploadedProducts }
    });
});

exports.getProducts = catchAsync(async(req, res, next) => {
    const products = await Product.findAll({
        attibutes: {exclude: ['updatedAt', 'createdAt']},
        where: {status: 'available'}
    });

    res.status(200).json({
        status: 'success',
        data: { products }
    })
});

exports.editProduct = catchAsync(async(req, res, next) => {
    const { code } = req.params;
    const { updatedData } = req.body;
    
    console.log(updatedData);

    const product = await Product.findOne({
    where: { code }
    })

    if(!product) return next(new AppError('El producto que ingresaste no existe'));

    await Product.update(updatedData, {where: {code}});

    res.status(204).json({status: 'success'});
});

exports.deleteProduct = catchAsync(async(req, res, next) => {
    const { code } = req.params;

    const product = await Product.findOne({
        where: { code }
    })
    
    if(!product) return next(new AppError('El producto que ingresaste no existe'));

    await Product.update({status: 'unavailable'}, {where: {code}});

    res.status(204).json({status: 'success'});
}); 