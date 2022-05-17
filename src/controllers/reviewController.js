const Review = require('../models/reviewModel');
const Book = require('../models/bookModel');
const { isValidObjectId, isValidBody, validString } = require('../utils/validation');

// POST /books/:bookId/review
const addReview = async (req, res) => {
  try {
    let bookId = req.params.bookId;

    // check valid bookId
    if(!isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "Enter a valid book id" });

    let checkBookId = await Book.findById(bookId);
    if(!checkBookId) return res.status(404).send({ status: false, message: "Book not found" });

    if(checkBookId.isDeleted == true) return res.status(404).send({ status: false, message: "Book not found or might have been deleted" })

    let data = req.body;

    // validate the request body
    if(isValidBody(data)) return res.status(400).send({ status: false, message: "Details required to add review to book" });

    // check rating
    if(!data.rating) return res.status(400).send({ status: false, message: "Rating is required and should not be 0" });
    
    //checking if data has valid data or not
    if (validString(data.reviewedBy) || validString(data.review)) {
      return res.status(400).send({ status: false, message: "Enter valid data in review and reviewedBy" })
    }

    //Checking that rating should be only in numbers and between 1 to 5
    if(!validString(data.rating)) return res.status(400).send({ status: false, message: "Rating should be in numbers" });
    if(!((data.rating < 6 ) && (data.rating > 0))) return res.status(400).send({ status: false, message: "Rating should be between 1 - 5 numbers" });

    data.bookId = bookId;

    //Updating the review
    let reviewData = await Review.create(data) ;
    await Book.updateOne(
      {_id: bookId},
      {$inc: {reviews: 1}}
    )

    res.status(201).send({ status: true, message: "Success", data: reviewData })
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
}


// PUT /books/:bookId/review/:reviewId

const updateReview = async (req, res) => {
  try {
    let getID = req.params

    // check valid bookId
    if(!isValidObjectId(getID.bookId)) return res.status(400).send({ status: false, message: "Enter a valid Book id" });
    
    // check valid reviewId
    if(!isValidObjectId(getID.reviewId)) return res.status(400).send({ status: false, message: "Enter a valid Review id" });

   //Checking if review data exist or not
   let checkReviewId = await Review.findById(getID.reviewId);
   if(!checkReviewId) return res.status(404).send({ status: false, message: "Review not found check id and try again" });

   if(checkReviewId.bookId.toString() !== getID.bookId) return res.status(404).send({ status: false, message: "Book not found check id and try again" });

    //Checking if review is already deleted or not
    if(checkReviewId.isDeleted == true) return res.status(404).send({ status: false, message: "Review not found or might have been deleted" });
    
    //getting the data from request body to update the review
    let data = req.body;

    // validate the body
    if(isValidBody(data)) return res.status(400).send({ status: false, message: "Data is required to update document" });

    //checking if user tries to change attributes which he/she is not allowed to do it
    if(data.hasOwnProperty('bookId') || data.hasOwnProperty('isDeleted') || data.hasOwnProperty('reviewedAt')) return res.status(400).send({ status: false, message: 'Action is Forbidden' });

    //checking if the data is a valid data 
    if (validString(data.reviewedBy) || validString(data.review)) {
      return res.status(400).send({ status: false, message: "Enter valid data in review and reviewedBy" })
    }

    if(data.hasOwnProperty('rating')){

      // check rating
      if(!validString(data.rating)) return res.status(400).send({ status: false, message: "Rating should be in numbers" });

      if(!((data.rating < 6 ) && (data.rating > 0))) return res.status(400).send({ status: false, message: "Rating should be between 1 - 5 numbers" });
    }
    
    //Updating the review
    let updatedReview = await Review.findByIdAndUpdate(
      {_id: getID.reviewId},
      data,
      {new: true}
    )
 
    res.status(200).send({ status: true, message: "Review updated successfully", data: updatedReview }); 
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
}

// DELETE /books/:bookId/review/:reviewId
const deleteReview = async (req, res) => {
  try {
    let getID = req.params

    // check valid bookId
    if(!isValidObjectId(getID.bookId)) return res.status(400).send({ status: false, message: "Enter a valid Book id" });
    
    // check valid reviewId
    if(!isValidObjectId(getID.reviewId)) return res.status(400).send({ status: false, message: "Enter a valid Review id" });

   //Checking if review data exist or not
   let checkReviewId = await Review.findById(getID.reviewId);
   if(!checkReviewId) return res.status(404).send({ status: false, message: "Review not found check id and try again" });

   if(checkReviewId.bookId.toString() !== getID.bookId) return res.status(404).send({ status: false, message: "Book not found check id and try again" });

    //Checking if review is already deleted or not
    if(checkReviewId.isDeleted == true) return res.status(404).send({ status: false, message: "Review not found or might have been deleted" });

    //Updating the review
    await Review.updateOne(
      {_id: getID.reviewId},
      { isDeleted: true }
    )

    //Updating the reviews count in Book by decrease it by 1
    await Book.updateOne(
      {_id: getID.bookId},
      {$inc: {reviews: -1}}
    )
    
    res.status(200).send({ status: true, message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
} 

module.exports = { addReview, updateReview, deleteReview };