const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cors = require('cors');
const passport = require('passport');

//Passport use to can use Azure Active Directory
const { LocalStrategy } = require('../middlewares/passport.middleware');

//Utils
const AppError = require('../utils/appError');

//Controllers
const { globalErrorHandler } = require('../controllers/error.controller');

//Routers
const { employeeRouter } = require('../routers/employees.routes');
const { productRouter } = require('../routers/products.routes');
const { salesRouter } = require('../routers/sales.routes');
const { rentsRouter } = require('../routers/rents.routes');

const app = express();

app.use(helmet());

app.use('*', cors());

app.use('*', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, PUT, DELETE, OPTIONS'
    );

    next();
});

app.set('trust proxy', 1);

app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
        limit: '20mb'
    })
);

//Compress responses
app.use(compression());

//Create file for logs when in production
if(process.env.NODE_ENV === 'production') app.use(moran('combined'));
else app.use(morgan('dev'));

app.use(passport.initialize());

LocalStrategy(passport);

//Routes
app.use('/api/employees', employeeRouter);
app.use('/api/products', productRouter);
app.use('/api/sales', salesRouter);
app.use('/api/rents', rentsRouter);

app.all("*", (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;

