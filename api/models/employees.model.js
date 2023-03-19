const { DataTypes } = require('sequelize');

const { sequelize } = require('../utils/database');

const Employee = sequelize.define(
    'employees',
    {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            allownull: false,
            type: DataTypes.STRING(100),
            validate: {
                isEmail: true
            }
        },
        password: {
            allowNull: false,
            type: DataTypes.STRING(255)
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        }
    }
);

exports.Employee = Employee;