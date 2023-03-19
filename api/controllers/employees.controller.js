const jwt = require('jsonwebtoken');

//Models
const { Employee } = require('../models/employees.model');

//Utils
const catchAsync = require('../utils/catchAsync');
const Password = require('../utils/password');
const AppError = require('../utils/appError');

const signToken = async id => {
    let secret;
    let expiresIn;

    secret = process.env.JWT_SECRET;
    expiresIn = process.env.JWT_EXPIRES_IN;

    const payload  = {
        sub: id,
        iat: Date.now()
    }

    const snToken = jwt.sign(payload, secret, {
        expiresIn: expiresIn
    });
    return { token: `Bearer ${snToken}`}
};

const createAndSendToken = async (employee, req, res) => {
    const { token } = await signToken(employee.id);

    res.status(200).json({
        status: 'success', 
        data: {
            employee, 
            token
        }
    });
}

exports.logEmployee = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    const employee = await Employee.findOne({
       where: {
            email
       } 
    })

    if(!employee) return next(new AppError('El correo ingresado es inválido', 404))

    //Validate password
    const passwordHandler = new Password();
    const passwordValid = await passwordHandler.comparePassword(
        password, 
        employee.password
    );

    if(!passwordValid) return next(new AppError('La contraseña es incorrecta'), 503);

    //Remove password from response
    employee.password = undefined;

    //Generate token
    createAndSendToken(employee, req, res);
});

exports.createEmployee = catchAsync(async (req, res, next) => {
    const { name, password, email } = req.body;

    const employeeExists = await Employee.findOne({
        where: {
            email
        }
    })

    if(employeeExists) return next(new AppError('El correo que ingresó ya está en uso', 418));

    //Hash password
    const passwordHandler = new Password();
    const hashPassword = await passwordHandler.generatePassword(password).catch(err => console.log(err));

    await Employee.create({
        name,
        password:hashPassword,
        email
    });

    res.status(201).json({
        status: 'success'
    });
});

exports.deleteEmployee = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    await Employee.destroy({where: {id}})

    res.status(201).json({
        status: 'success'
    });
});