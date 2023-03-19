require('dotenv').config();
const moment = require('moment');

//Utils
const { sequelize } = require('../utils/database');
const { initModelRelations } = require('../utils/modelRelations');

//App
const app = require('./app');


//* CONNECT TO DATABASE *
initModelRelations();
sequelize
    .sync()
    .then(res => console.log('Successful connection to db'))
    .catch(err => console.log('Could not connect to db', err))

const port =  process.env_PORT || 3000;

const server = app.listen(port, async () => {
    const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
    console.log(`API running on Port ${port} succesfully! - API started at: ${currentDate}`)
})