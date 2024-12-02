const { Schema, model } = require("mongoose");
const bcrypt = require('bcrypt');
// const { subscribe } = require("../routes/user.routes");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const crypto = require('crypto');

//load env
dotenv.config();


const UserSchema = new Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,  // Remove leading and trailing whitespaces
        minlength: [3, 'Full name must be at least 3 characters long'],
        maxlength: [50, 'Full name must be less than 50 characters long']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,  // Remove leading and trailing whitespaces
        lowercase: true,  // Convert to lowercase
        unique: true,  // Ensure unique emails
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,  // Regex to match email pattern
            'Please enter a valid email address'
        ]
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        maxlength: [100, 'Password cannot exceed 100 characters']
    },
    avatar: {
        public_id: {
            type: 'String'
        },
        secure_url: {
            type: 'string'
        }
    },
    role: {
        type: String,
        enum: ['USER', 'ADMIN'],
        default: 'ADMIN'
    },
    forgotPasswordToken: String,
    forgotPasswardExpire: Date

}, {
    timestamps: true
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
})

UserSchema.methods = {
    generateJWTToken: async function () {
        return await jwt.sign(
            { id: this._id, email: this.email, subscription: this.subscription, role: this.role },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: process.env.JWT_EXPIRE_TIME,
            }
        )
    },
    comparePassword: async function (plainTextPassword) {
        return await bcrypt.compare(plainTextPassword, this.password);
    },
    generatePasswordResetToken: async function () {
        const resteToken = crypto.randomBytes(20).toString('hex');

        this.forgotPasswordToken = crypto
            .createHash('sha256')
            .update(resteToken)
            .digest('hax');

        this.forgotPasswardExpire = Date.now() + 15 * 60 * 1000; // 15min from now

        return resteToken;
    }
}




const User = model("User", UserSchema)

module.exports = User;