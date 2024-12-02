const AppError = require("../utils/error.util");
const jwt = require('jsonwebtoken');
const course = require('../models/course.model')



const authorizeRoles = (...roles) => async (req, res, next) => {

    // console.log("chekking user role", req.user)
    const currentUserRole = req.user.role;
    if (!roles.includes(currentUserRole)) {
        return next(new AppError("You do not have permission to access this routes", 403));
    }
    next();

}

module.exports = authorizeRoles;