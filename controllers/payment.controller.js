const razorpay = require("razorpay");
const User = require("../models/User.model");
const AppError = require("../utils/error.util");
const Payment = require("../models/payment.model");
// const { subscribe } = require("../routes/payment.router");

const getRazorpayApiKey = async (req, res, next) => {
    res.status(200).json({
        sucesss: true,
        message: 'razorpay api key',
        key: process.env.RAZORPAY_KEY_ID
    });
}

const buySubscription = async (req, res, next) => {
    try {
        const { id } = req.user;

        const user = await User.findById(id);

        if (!user) {
            return next(new AppError('Unauthorize, plese loging'))
        }

        if (user.role === 'ADMIN') {
            return next(new AppError('Admin can not purchase'))
        }

        const subscription = await Razorpay.subscription.create({
            plan_id: process.env.RAZORPAY_PLAN_ID,
            customer_notify: 1
        })

        user.subscription.id = subscription.id;
        user.subscription.status = subscription.status;

        await user.save();

        res.status(200).json({
            sucesss: true,
            message: 'Subscribe Successfully',
            subscription_id: subscription.id
        });
    }
    catch (e) {
        return next(new AppError(e.message, 500));
    }
}

const verifySbscription = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;
        const user = await User.findById(id);
        if (!user) {
            return next(new AppError('Unauthorize, plese loging'))
        }

        const subscriptionId = user.subscription.id;

        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(`${razorpay_payment_id}|${subscriptionId}`)
            .digest('hex');

        if (generatedSignature !== razorpay_signature) {
            return next(new AppError('Payment not verify, please try again', 500));
        }

        await Payment.create({
            razorpay_payment_id,
            razorpay_subscription_id,
            razorpay_signature,
        })

        user.subscription.status = 'active';
        await user.save();

        res.status(200).json({
            sucesss: true,
            message: "Payment verify sucessfully!"
        })
    }
    catch (e) {
        return next(new AppError(e.message, 500));
    }
}

const cancelSubscription = async (req, res, next) => {
    try {
        const { id } = req.user;

        const user = await User.findById(id);

        if (!user) {
            return next(new AppError('Unauthorize, plese loging'))
        }

        if (user.role === 'ADMIN') {
            return next(new AppError('Admin can not cancel'))
        }

        const subscriptionId = user.subscription.id;

        const subscription = await razorpayazorpay.subscriptions.cancel(subscriptionId)

        user.subscription.status = subscription.status;
        await user.save();
    }
    catch (e) {
        return next(new AppError(e.message, 500));
    }
}

const allPayments = async (req, res, next) => {
    try {
        const { count } = req.query;

        const subscriptions = await razorpay.subscriptions.all({
            count: count || 10,
        });

        res.status(200).json({
            sucesss: true,
            message: 'All payments',
            subscriptions
        });
    }
    catch (e) {
        return next(new AppError(e.message, 500));
    }
}

module.exports = { getRazorpayApiKey, buySubscription, verifySbscription, cancelSubscription, allPayments };