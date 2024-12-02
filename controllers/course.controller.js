const Course = require("../models/course.model");
const AppError = require("../utils/error.util");
const fs = require('fs/promises');
const cloudinary = require('cloudinary');


const getAllCourses = async (req, res, next) => {
    try {
        const courses = await Course.find({}).select('-lectures');

        res.status(200).json({
            sucess: true,
            message: 'All courses',
            courses,
        });
    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}

const getLecturesByCouseId = async (req, res, next) => {
    try {
        const { id } = req.params;
        const course = await Course.findById(id);

        res.status(200).json({
            sucess: true,
            message: 'Course lectures featch sucessfully',
            lectures: course.lectures,
        });
    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}

const createCourse = async (req, res, next) => {
    try {
        const { title, description, category, createdBy } = req.body;

        if (!title || !description || !category || !createdBy) {
            return next(new AppError('All fields required', 400));
        }

        const course = await Course.create({
            title,
            description,
            category,
            createdBy,
            thumbnail: {
                public_id: 'dummay',
                secure_url: 'dummay',
            },
        });

        if (!course) {
            return next(new AppError('Course could not created try again', 400));
        }

        if (req.file) {
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: 'lms',
                });

                if (result) {
                    course.thumbnail.public_id = result.public_id;
                    course.thumbnail.secure_url = result.secure_url;
                }
                fs.rm(`upload/${req.file.filename}`);//delete from local machine
            } catch (e) {
                return next(new AppError("File not uploaded try again", 500))
            }
        }

        await course.save();

        res.status(201).json({
            success: true,
            message: "Course created sucessfull",
            course,
        });
    } catch (e) {
        return next(new AppError('Course created failed, please try again', 500));
    }
}

const updateCourse = async (req, res, next) => {
    try {
        const { id } = req.params;
        const course = await Course.findByIdAndUpdate(id,
            {
                $set: req.body
            },
            {
                runValidators: true
            }
        );
        if (!course) {
            return next(new AppError("Course with given id does not exits", 500))
        }

        res.status(201).json({
            success: true,
            message: "Course update sucessfully",
            course,
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
}

const removeCourse = async (req, res, next) => {
    try {
        const { id } = req.params;
        const course = await Course.findById(id);

        if (!course) {
            return next(new AppError("Course with given id does not exits", 500))
        }
        await Course.findByIdAndDelete(id);

        res.status(201).json({
            success: true,
            message: "Course deleted successfully"
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
}

const addLectureToCourseById = async (req, res, next) => {
    try {
        const { title, description } = req.body;
        const { id } = req.params;

        if (!title || !description) {
            return next(new AppError('All fields required', 400));
        }

        const course = await Course.findById(id);
        if (!course) {
            return next(new AppError("Course with given id does not exits", 500))
        }

        const lectureData = {
            title,
            description,
            lecture: {}
        };

        if (req.file) {
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: 'lms',
                });

                if (result) {
                    lectureData.lecture.public_id = result.public_id;
                    lectureData.lecture.secure_url = result.secure_url;
                }

                fs.rm(`upload/${req.file.filename}`);//delete from local machine
            } catch (e) {
                return next(new AppError("File not uploaded try again", 500))
            }
        }

        course.lectures.push(lectureData);

        course.numberOfLectures = course.lectures.length;

        await course.save();

        res.status(201).json({
            success: true,
            message: "Lectures uploaded successfully",
            course,
        });
    } catch (e) {
        return next(new AppError("Lectures uploaded failed, please try again", 500));
    }
}

const removeLectureFromCourseByTitle = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title } = req.body;  // Get lecture title from the request body

        // Find the course by its ID
        const course = await Course.findById(id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Find the lecture by title
        const lectureIndex = course.lectures.findIndex(lecture => lecture.title === title);

        if (lectureIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Lecture not found'
            });
        }

        // Remove the lecture
        course.lectures.splice(lectureIndex, 1);  // Remove the lecture at the found index
        course.numberOfLectures = course.lectures.length;  // Update the lecture count

        // Save the updated course
        await course.save();

        res.status(200).json({
            success: true,
            message: 'Lecture removed successfully',
            course
        });

    } catch (error) {
        return next(new AppError("Please try again for remove", 500))
    }
}


module.exports = { getAllCourses, createCourse, getLecturesByCouseId, updateCourse, removeCourse, addLectureToCourseById, removeLectureFromCourseByTitle };