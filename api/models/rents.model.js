const { DataTypes } = require('sequelize')
const { sequelize } = require('../utils/database')

const Rent = sequelize.define(
    'rents',
    {
        ticket: {
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
        deposit: {
            type: DataTypes.FLOAT,
            allowNull: false            
        },
        total: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        deliver: {
            type: DataTypes.DATE,
            allowNull: false
        },
        returning: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }
);

exports.Rent = Rent;