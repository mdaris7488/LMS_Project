const { Schema, model } = require("mongoose");

const courseSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,  // Remove leading and trailing whitespaces
        minlength: [8, 'Title must be at least 8 characters long'],
        maxlength: [50, 'Title must be less than 50 characters long']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,  // Remove leading and trailing whitespaces
        minlength: [8, 'Description must be at least 8 characters long'],
        maxlength: [200, 'Description must be less than 200 characters long']
    },
    category: {
        type: String,  // Define category type
        required: [true, 'Category is required']
    },
    thumbnail: {
        public_id: {
            type: String,
            required: true
        },
        secure_url: {
            type: String,
            required: true
        }
    },
    lectures: [
        {
            title: String,
            description: String,
            lecture: {
                public_id: {
                    type: String,
                    required: true
                },
                secure_url: {
                    type: String,
                    required: true
                }
            }
        }
    ],
    numberOfLectures: {  // Renamed to camelCase and fixed typo
        type: Number,
        default: 0
    },
    createdBy: {
        type: String,
        required: true
    },
    subscription: {
        id: String,
        status: String
    }
}, {
    timestamps: true  // Fixed typo in 'timestamps' option
});

const Course = model('Course', courseSchema);

module.exports = Course;
