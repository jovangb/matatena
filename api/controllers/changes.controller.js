//Models
const { Product } = require('../models/products.model');
const { Change } = require('../models/changes.model');
const { SaleDetail } = require('../models/sale-detail.model');
const { ChangeDetail } = require('../models/change-detail.model');
const catchAsync = require('../utils/catchAsync');
const { sequelize } = require('../utils/database');

exports.newChange = catchAsync(async (req, res, next) => {
    const { saleTicket } = req.params;
    const { date, payment, detailsToChange, total } = req.body;

    const t = await sequelize.transaction();

    try {
        const change = await Change.create({
            date,
            payment, 
            total,
            saleTicket
        })

        for (const detail of detailsToChange) {
            //Update stock
            await Product.increment('quantity', { where: {code: detail.oldDetail.code}});
            await Product.decrement('quantity', { where: {code: detail.newDetail.code}});

            await SaleDetail.update({changed: true}, {where: {id: detail.oldDetail.id}});
            
            await ChangeDetail.create({
                difference: detail.difference,
                saleDetailId: detail.oldDetail.id,
                changeId: change.id,
                productCode: detail.newDetail.code
            })
        }

        await t.commit();

        res.status(200).json({status: 'success'});

    } catch (err) {
        console.log(err);
        await t.rollback();
    }
});