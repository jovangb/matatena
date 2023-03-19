const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const ChangeDetail = sequelize.define(
    'change_details',
    {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            unique: true,
            autoIncrement: true
        },
        difference: {
            type: DataTypes.FLOAT,
            allowNull: false,
        }
    }
);

exports.ChangeDetail = ChangeDetail;