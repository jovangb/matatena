//Models 
const { Product } = require('../models/products.model');
const { Sale } = require('../models/sale.model');
const { SaleDetail } = require('../models/sale-detail.model');
const { Change } = require('../models/changes.model');
const { ChangeDetail } = require('../models/change-detail.model');
const { Rent } = require('../models/rents.model');

const initModelRelations = () => {
    //* 1 Sale --> Many SaleDetails
    Sale.hasMany(SaleDetail);
    SaleDetail.belongsTo(Sale);

    //*1 Product --> Many SaleDetails
    Product.hasMany(SaleDetail);
    SaleDetail.belongsTo(Product)

    //*1 Sale --> Many Changes
    Sale.hasMany(Change);
    Change.belongsTo(Sale)

    //*1 SaleDetail --> 1 ChangeDetail
    SaleDetail.hasOne(ChangeDetail);
    ChangeDetail.belongsTo(SaleDetail);

    //*1 Change --> Many ChangeDetails
    Change.hasMany(ChangeDetail);
    ChangeDetail.belongsTo(Change);

    //*1 Product --> Many ChangeDetails
    Product.hasMany(ChangeDetail);
    ChangeDetail.belongsTo(Product);

    //*1 Product --> Many Rents
    Product.hasMany(Rent);
    Rent.belongsTo(Product);
};

module.exports = { initModelRelations }