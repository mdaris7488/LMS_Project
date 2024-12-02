const User = require('../models/User.model')
const AppError = require('../utils/error.util')
const err = require('../middleware/error.middleware');
const fs = require('fs/promises');
const sendEmail = require('../utils/sendEmail');
const cloudinary = require('cloudinary');

const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true
}

const register = async (req, res, next) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return next(new AppError('All fields are required', 400));
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return next(new AppError('Email already exits', 400));
        }

        const user = await User.create({
            fullName,
            email,
            password,
            avatar: {
                public_id: email,
                secure_url: "https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg"
            }
        })

        if (!user) {
            return next(new AppError('Register failed, Please try again', 400));
        }

        // TODO: File upload
        if (req.file) {
            console.log(req.file);
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: 'lms',
                    width: 250,
                    height: 250,
                    gravity: 'faces',
                    crop: 'fill'
                });

                if (result) {
                    user.avatar.public_id = result.public_id;
                    user.avatar.secure_url = result.secure_url;
                    // remove file from server
                    fs.rm(`upload/${req.file.filename}`);
                }
            } catch (e) {
                return next(new AppError("File not uploaded, Please try again", 500))
            }
        }

        await user.save();
        user.password = undefined;

        const token = await user.generateJWTToken();

        res.cookie('token', token, cookieOptions)

        console.log("save");

        res.status(201).json({
            success: true,
            message: "User Register successfully",
            user,
        })
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
}

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new AppError('All field are required', 400));
        }

        const user = await User.findOne({ email })
            .select('+password');

        if (!user || !user.comparePassword(password)) {
            return next(new AppError('Email or Password does not match', 400));
        }

        const token = await user.generateJWTToken();
        user.password = undefined;

        res.cookie('token', token, cookieOptions);

        res.status(200).json({
            success: true,
            message: "Logging successfully",
            user,
        })
    }
    catch (e) {
        return next(new AppError(e.message, 500));
    }
}

const logout = (req, res) => {
    try {
        res.cookie('token', null, {
            secure: true,
            maxAge: 0,
            httpOnly: true
        });

        res.status(200).json({
            success: true,
            message: "Logout successfully"
        })
    }
    catch (e) {
        return next(new AppError(e.message, 500));
    }
}

const getProfile = async (req, res, next) => {
    try {
        const UserId = req.user.id;
        const user = await User.findById(UserId);

        res.status(200).json({
            success: true,
            message: "User Details",
            user
        });
    }
    catch (e) {
        return next(new AppError("Field to featch details", 500))
    }
}

const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return next(new AppError("Email is required", 400));
        }

        const user = await User.findOne({ email });
        if (!user) {
            return next(new AppError("Email Not registered", 400));
        }

        const resetToken = await user.generatePasswordResetToken();

        await user.save();

        const resetPasswordURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        const subject = 'reset passwordd';
        const message = `<p>You are receiving this email because you (or someone else) requested a password reset for your account. Please make a PUT request to:</p>
        <a href="${resetPasswordURL}" target="_blank">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
      `
        try {
            await sendEmail(email, subject, message);

            res.status(200).json({
                success: true,
                message: `reset password token has benn send to ${email} sucessfully`
            })
        } catch (e) {
            user.forgotPasswardExpire = undefined;
            user.forgotPasswordToken = undefined;

            await user.save();

            return next(new AppError(e.message, 500))
        }
    }
    catch (e) {
        return next(new AppError(e.message, 500));
    }
}

const resetPassword = async (req, res, next) => {
    try {
        const { resetToken } = req.params;
        const { password } = req.body;

        const forgotPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hax')
            ;

        const user = await User.findOne({
            forgotPasswordToken,
            forgotPasswardExpire: { $gt: Date.now() }
        });

        if (!user) {
            return next(new AppError("token is expired plz try again", 400));
        }

        user.password = password;
        user.forgotPasswordToken = undefined;
        user.forgotPasswardExpire = undefined;

        user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed sucessfully'
        })
    }
    catch (e) {
        return next(new AppError(e.message, 500));
    }
}

const changePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const { id } = req.user;

        if (!newPassword || !newPassword) {
            return next(new AppError("All Fields are Mandatory", 400));
        }

        const user = await User.findById(id).select('+password');
        if (!user) {
            return next(new AppError("User does't exits", 400));
        }

        const isPasswordValid = await user.comparePassword(oldPassword);
        if (!isPasswordValid) {
            return next(new AppError("Invalid old passsword", 400));

        }
        user.password = newPassword;

        await user.save();

        user.password = undefined;

        res.status(200).json({
            success: true,
            message: "Password changed sucessfully"
        });
    }
    catch (e) {
        return next(new AppError(e.message, 500));
    }
}

const UpdateUser = async (req, res, next) => {
    try {
        const { fullName } = req.body;
        const { id } = req.user.id;

        const user = await User.findById(id);

        if (!user) {
            return next
                (new AppError("User does't exits", 400));
        }

        if (req.fullName) {
            user.fullName = fullName;
        }

        if (req.file) {
            await cloudinary.v2.uploader.destroy(user.avatar.public_id);
        }

        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms',
                width: 250,
                height: 250,
                gravity: 'faces',
                crop: 'fill'
            });

            if (result) {
                user.avatar.public_id = result.public_id;
                user.avatar.secure_url = result.secure_url;
                // remove file from server
                fs.rm(`uploads/${req.file.filename}`)
            }
        } catch (e) {
            return next(new AppError(e || "File not uploaded try again", 500))
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "User updated sucessfully"
        });

        res.cookie('token', null, {
            secure: true,
            maxAge: 0,
            httpOnly: true
        });

        res.status(200).json({
            success: true,
            message: "Logout successfully"
        })
    } catch (e) {
        return next(new AppError(e.message, 500));

    }
}


module.exports = { getProfile, register, login, logout, forgotPassword, resetPassword, changePassword, UpdateUser }