//Models
const { Product } = require('../models/products.model')
const { Sale } = require('../models/sale.model')
const { SaleDetail } = require('../models/sale-detail.model');
const { ChangeDetail } = require('../models/change-detail.model');
const { sequelize } = require('../utils/database');
const catchAsync = require('../utils/catchAsync');
const { Change } = require('../models/changes.model');


exports.newSale = catchAsync(async (req, res, next) => {
    const { 
        date,
        payment, 
        details,
        total
     } = req.body;

     const t = await sequelize.transaction();

     try {
        const sale = await Sale.create({
            date,
            payment,
            total
        });
    
        //Add sale details
        for (const detail of details) {
            //Create detail and update stock
            const product = await Product.findOne({
                where: { code: detail.code }
            })

            if(product.quantity - 1 < 0){
                return next(new AppError('Algunos de los productos están fuera de stock, no es posible ejecutar la venta'))
            }
            
            await product.update({
                quantity: product.quantity - 1
            })

            await SaleDetail.create({
                saleTicket: sale.ticket,
                productCode: detail.code
            })
        }

        await t.commit();

        res.status(200).json({status: 'success'})

     } catch (err) {
        console.log(err);
        await t.rollback();
     }
})

exports.getSales = catchAsync(async (req, res, next) => {
    const sales = await Sale.findAll({
        include: [
            {
                model: SaleDetail,
                include: {
                    model: Product
                }
            }
        ]
    })
    

    res.status(200).json({
        status: 'success',
        data: { sales }
    })
})

exports.getSalesDetails = catchAsync(async(req,res,next)=>{
    const { saleTicket } = req.params;

    const salesDetails = await SaleDetail.findAll({
        include: {
            model: Product
        },
        where: {
            saleTicket: saleTicket
        }
    })

    res.status(200).json({
        status: 'success',
        data: { salesDetails }
    })
})

exports.getChangeDetails = catchAsync(async(req,res,next)=>{
    const { saleTicket } = req.params;

    const changes = await Change.findAll({
        include: [
            {
                model: ChangeDetail,
                include: [
                    {model: Product},
                    {
                        model: SaleDetail,
                        include: Product
                    }
                ]    
            }
        ],
        where: {
            saleTicket: saleTicket
        }
    })
    
    res.status(200).json({
        status: 'success',
        data: { changes }
    })
})

