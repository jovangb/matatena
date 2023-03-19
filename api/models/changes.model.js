const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const Change = sequelize.define(
    'changes',
    {
        id: {
            type: DataTypes.INTEGER(11),
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
            unique: true
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        payment: {
            type: DataTypes.STRING(10),
            allowNull: false,
            validate: {
                isIn:[['efectivo', 'tarjeta']]
            }
        },
        total: {
            type: DataTypes.FLOAT,
            allowNull: false
        }
    }
);

exports.Change = Change;