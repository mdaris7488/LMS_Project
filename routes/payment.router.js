const express = require('express');
const { getRazorpayApiKey, buySubscription, verifySbscription, cancelSubscription, allPayments } = require('../controllers/payment.controller');
const isLoggedIn = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/authorizeroles');

const router = express.Router();

router.get('/razorpay-key',isLoggedIn, getRazorpayApiKey);
router.post('/subscribe', isLoggedIn,buySubscription);
router.post('/verify', isLoggedIn,verifySbscription);
router.post('/unsubscribe',isLoggedIn, cancelSubscription);
router.get('/', isLoggedIn,authorizeRoles('ADMIN'),allPayments);

module.exports = router;
