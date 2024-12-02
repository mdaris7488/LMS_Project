const mongoose = require('mongoose');
const dotenv = require('dotenv');

//load env config
dotenv.config();

mongoose.set('strictQuery', false);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // useNewUrlParser: true,      // Parses MongoDB connection string
      // useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: {conn.connection.host}`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = connectDB;