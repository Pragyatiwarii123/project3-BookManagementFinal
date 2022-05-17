const express = require('express');
const { createUser, userLogin } = require('../controllers/userController');
const { createBook, getFilteredBooks, getBookById, updateBook, deleteBook } = require('../controllers/bookController');
const { addReview, updateReview, deleteReview } = require('../controllers/reviewController');
const { authentication, authorization } = require('../middleware/auth');

const router = express.Router();

//Users API
router.post('/register', createUser);
router.post('/login', userLogin);

//Books API
router.post('/books', authentication, authorization, createBook);
router.get('/books', authentication, getFilteredBooks);
router.get('/books/:bookId', authentication, getBookById);
router.put('/books/:bookId', authentication, authorization, updateBook)
router.delete('/books/:bookId', authentication, authorization, deleteBook);

//Review API
router.post('/books/:bookId/review', addReview);
router.put('/books/:bookId/review/:reviewId', updateReview);
router.delete('/books/:bookId/review/:reviewId', deleteReview);

module.exports = router