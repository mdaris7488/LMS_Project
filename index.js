const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/user.routes'); // Import auth routes
const paymentRoute = require('./routes/payment.router')
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morgan = require('morgan');
const errorMiddleware = require('./middleware/error.middleware');
const cloudinary = require('cloudinary');
const CourseRouter = require('./routes/course.router'); // Import auth routes
const Razorpay = require('razorpay');

const app = express();

//load env
dotenv.config();
// Middleware to parse incoming JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// app.use(cors())
app.use(morgan('dev'));

// Connect to MongoDB
connectDB();

app.get('/', (req, res) => {
    res.send('Hello World!')
})
// Use auth routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/courses', CourseRouter);
app.use('/api/v1/payment', paymentRoute);

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET

})

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

});

app.all('*', (req, res) => {
    res.status(400).send('OPPS Page not found')
})

app.use(errorMiddleware);

app.use(cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true
}));

module.export = razorpay;