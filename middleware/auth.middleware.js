const AppError = require("../utils/error.util");
const jwt = require('jsonwebtoken');
const User=require('../models/User.model')

const isLoggedIn = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new AppError('Unauthenticaed, plz login again', 401));
    }

    const userDetails = await jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.user = userDetails;

    next();
}

// const authorizeRoles = (...roles) => async (req, res, next) => {

//     // console.log("chekking user role", req.user)
//     const currentUserRole = req.user.role;
//     if (!roles.includes(currentUserRole)) {
//         return next(new AppError("You do not have permission to access this routes", 403));
//     }
//     next();

// }


module.exports = isLoggedIn;