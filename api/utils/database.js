const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;
let connectionOptions;

if(process.env.NODE_ENV === 'development'){
    connectionOptions = {
        dialect: process.env.DB_DIALECT, 
        host: process.env.HOST,
        database: process.env.DATABASE
    }
    
    sequelize = new Sequelize(process.env.DATABASE, process.env.DB_USERNAME, process.env.DB_USERNAME_PASSWORD, connectionOptions);

}else{
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialectOptions: {
            ssl: {
                rejectUnauthorized: false
            }
        }
    });
}

exports.sequelize = sequelize;
