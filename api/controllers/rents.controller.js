//Models
const { Rent } = require('../models/rents.model');

//Utils
const catchAsync = require('../utils/catchAsync');

exports.newRent = catchAsync(async (req, res, next) => {
    const {
        productCode,
        date, 
        payment,
        deposit,
        total
    } = req.body;

    await Rent.create({
        productCode,
        date,
        payment,
        deposit,
        total
    })

    res.status(200).json({status: 'success'})
});

exports.getRents = catchAsync(async (req, res, next) => {
    const rents = await Rent.findAll({
        include: { all: true, nested: true}
    })

    res.status(200).json({
        status: 'success',
        data: { rents }
    })
});