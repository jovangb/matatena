const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const Product = sequelize.define(
    'products',
    {
        code: {
            type: DataTypes.STRING(100),
            allowNull: false,
            primaryKey: true,
            unique: true
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        productType: {
            type: DataTypes.STRING(255),
        },
        size: {
            type: DataTypes.STRING(20)
        },
        quantity: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        productCategory: {
            type: DataTypes.STRING(255)
        },
        status: {
            type: DataTypes.STRING(15),
            allowNull: false,
            defaultValue: 'available',
            validate: {
                isIn: [['available', 'unavailable']]
            }
        }
    }
);

exports.Product = Product;
