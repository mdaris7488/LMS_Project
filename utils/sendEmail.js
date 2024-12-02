const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

//load env
dotenv.config();

const sendEmail = async (email, subject, message) => {
    //create reusable transpoter object using the default smtp transport
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,// true for 465 ,false for other ports
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    await transporter.sendMail({
        from: process.env.SMTP_FROM_EMAIL, //send adddress
        to: email, //user email
        subject: subject, //subject line
        html: message, //hml body
    });

}

module.exports=sendEmail;