require ('dotenv').config();
const { AppError } = require('../utils/appError');

const sendErrorDev = (err, req, res) => {
    if(req.originalUrl.startsWith('/api')){
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    }
};

const sendErrorProd = (err, req, res) => {
    //API
    if(req.originalUrl.startsWith('/api')){
        //Operational, trusted error: send message to the client
        if(err.isOperational){
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        }

        //Programming or other unknown message to the client
        console.log('ERROR ', err);

        //Send generic message
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        });
    }
};

//Handles invalid session errors
const handleJWTError = () => {
    new AppError('Sesión invalida, inicie sesión de nuevo', 401);
}

const handleJWTExpiredError = () => {
    new AppError('Sesión expirada. Inicie sesión nuevamente', 401);
}

//Handle sequelize errors
const handleSequelizeValidationError = err => {
    const message = err.errors.map(error => error.message).join('. ');

    return new AppError(message, 500);
};

const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err, req, res);
    }
    else if(process.env.NODE_ENV === 'production'){
        let error = {...err};
        error.message = err.message;

        if(error.name === 'JsonWebTokenError') error = handleJWTError();
        if(error.name === 'TokenExpiredError') error = handleJWTExpiredError();
        if(error.name === 'SequelizeValidationError') error = handleSequelizeValidationError();
        sendErrorProd(error, req, res);
    }
};

module.exports = { globalErrorHandler };