const AppError = require("../utils/error.util");
const jwt = require('jsonwebtoken');
const course = require('../models/course.model')

const authorizeSubscriber = async (req, res, next) => {
    const subscription = req.user.subscription;
    const currentUserRole = req.user.role;

    if (currentUserRole !== 'ADMIN' && subscription.status !== 'Active') {
        return next(new AppError("Please subscribe to acees this route", 403));
    }

    next();
}

module.exports = authorizeSubscriber;