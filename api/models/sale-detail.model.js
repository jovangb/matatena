const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const SaleDetail = sequelize.define(
    'sale_details',
    {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            unique: true,
            autoIncrement: true
        },
        changed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }
);

exports.SaleDetail = SaleDetail;