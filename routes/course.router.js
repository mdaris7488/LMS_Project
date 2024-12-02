const express = require('express');
const { getAllCourses, createCourse, getLecturesByCouseId, updateCourse, removeCourse, addLectureToCourseById, removeLectureFromCourseByTitle } = require('../controllers/course.controller');
const isLoggedIn = require('../middleware/auth.middleware');
const upload = require('../middleware/multer.middleware');
const authorizeRoles = require('../middleware/authorizeroles');
const authorizeSubscriber = require('../middleware/authorizesubscriber');


const router = express.Router();

router.get('/', getAllCourses);
router.post('/', isLoggedIn, authorizeRoles('ADMIN'), upload.single('thumbnail'), createCourse);

router.get('/:id', isLoggedIn, getLecturesByCouseId);
router.put('/:id', isLoggedIn, authorizeSubscriber,authorizeRoles('ADMIN'), updateCourse);
router.delete('/:id', isLoggedIn, authorizeRoles('ADMIN'), removeCourse);
router.post('/:id', isLoggedIn, authorizeRoles('ADMIN'), upload.single('lecture'), addLectureToCourseById);
router.delete('/:id/lecture', isLoggedIn, authorizeRoles('ADMIN'), removeLectureFromCourseByTitle);




module.exports = router;