
const aws = require("aws-sdk")

const Book = require('../models/bookModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');


const { isValidBody, isValidObjectId, validString, validDate, validISBN } = require('../utils/validation');




//**************************************************************AWS-s3************************************************************************** */

// s3 and cloud storage
//  step1: multer will be used to get access to the file in nodejs( from previous session learnings)
//  step2:[BEST PRACTISE]:- always write s2 upload function separately- in a separate file/function..exptect it to take file as input and return the uploaded file as output
// step3: aws-sdk install - as package
// step4: Setupconfig for aws authenticcation- use code below as plugin keys that are given to you
//  step5: build the uploadFile funciton for uploading file- use code below and edit what is marked HERE only


//PROMISES:-
// -you can never use await on callback..if you awaited something , then you can be sure it is within a promise
// -how to write promise:- wrap your entire code inside: "return new Promise( function(resolve, reject) { "...and when error - return reject( err )..else when all ok and you have data, return resolve (data)

//-----------------------------------------------------------------------------------------------------------------------------------------------------------

aws.config.update({
  accessKeyId: "AKIAY3L35MCRVFM24Q7U",
  secretAccessKey: "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",
  region: "ap-south-1"
})

let uploadFile = async function (file) {
  return new Promise(function (resolve, reject) {
    // this function will upload file to aws and return the link
    let s3 = new aws.S3({ apiVersion: '2006-03-01' }); // we will be using the s3 service of aws

    var uploadParams = {
      ACL: "public-read",
      Bucket: "classroom-training-bucket",  //HERE
      Key: "abc/" + file.originalname, //HERE 
      Body: file.buffer
    }


    s3.upload(uploadParams, function (err, data) {
      if (err) {
        return reject({ "error": err })
      }
      console.log(data)
      console.log("file uploaded succesfully")
      return resolve(data.Location)
    })

    // let data= await s3.upload( uploadParams)
    // if( data) return data.Location
    // else return "there is an error"

  })
}


// POST /books

const createBook = async function (req, res) {
  try {
    let data = req.body;
    let files = req.files
    if (!(files && files.length > 0)) return res.status(400).send({ msg: "No file found" })
    let uploadedFileURL = await uploadFile(files[0])
    data.bookCover = uploadedFileURL
    console.log(data)

    // Validate the Body

    if (isValidBody(data)) {
      return res.status(400).send({ status: false, message: "Enter Book details" });
    }

    // if (data.hasOwnProperty('reviews')) {
    //   return res.status(400).send({ status: false, message: "Cannot edit review" });
    // }

    //check the title
    if (!data.title) {
      return res.status(400).send({ status: false, message: "Book title is required" });
    }

    // check the excerpt
    if (!data.excerpt) {
      return res.status(400).send({ status: false, message: "Excerpt is required" });
    }

    // check the ISBN
    if (!data.ISBN) {
      return res.status(400).send({ status: false, message: "ISBN number is required" });
    }

    // check the category
    if (!data.category) {
      return res.status(400).send({ status: false, message: "category is required" });
    }

    // check the subcategory
    if (!data.subcategory) {
      return res.status(400).send({ status: false, message: "subcategory is required" });
    }

    // check the releasedAt
    if (!data.releasedAt) {
      return res.status(400).send({ status: false, message: "ReleasedAt date is required" })
    }

    let availableUserId = await User.findById(data.userId)
    if (!availableUserId) {
      return res.status(404).send({ status: false, message: "User not found" })
    }

    // validate the excerpt, category,subcategory
    if (validString(data.excerpt) || validString(data.category) || validString(data.subcategory)) {
      return res.status(400).send({ status: false, message: "Data should be valid and does not contains numbers" })
    }

    //Checking for unique title
    let checkUniqueTitle = await Book.findOne({ title: data.title })
    if (checkUniqueTitle) {
      return res.status(400).send({ status: false, message: "Title already exist" })
    }

    // validate the releasedAt
    if (validDate(data.releasedAt)) {
      return res.status(400).send({ status: false, message: "Enter a valid released date in (YYYY-MM-DD) formate" })
    }

    // validate the ISBN
    if (validISBN(data.ISBN)) {
      return res.status(400).send({ status: false, message: "Enter a valid ISBN number" })
    }

    //Checking for unique title
    let checkUniqueISBN = await Book.findOne({ ISBN: data.ISBN })
    if (checkUniqueISBN) {
      return res.status(400).send({ status: false, message: "ISBN already exist" })
    }

    let createBook = await Book.create(data)
    res.status(201).send({ status: true, message: "Book Created Successfully", data: createBook })
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

// GET /books

const getFilteredBooks = async (req, res) => {
  try {
    let data = req.query;

    // validate query params
    if (isValidBody(data)) {
      let getBooks = await Book.find({ isDeleted: false }).sort({ title: 1 }).select({ title: 1, excerpt: 1, userId: 1, category: 1, reviews: 1, releasedAt: 1 });

      if (getBooks.length == 0) return res.status(404).send({ status: false, message: "No books found" });
      return res.status(200).send({ status: true, count: getBooks.length, message: "Books list", data: getBooks });
    }

    if (data.hasOwnProperty('userId')) {
      if (!isValidObjectId(data.userId)) return res.status(400).send({ status: false, message: "Enter a valid user id" });
      let { ...tempData } = data;
      delete (tempData.userId);
      let checkValues = Object.values(tempData);

      if (validString(checkValues)) return res.status(400).send({ status: false, message: "Filter data should not contain numbers excluding user id" })
    } else {
      let checkValues = Object.values(data);

      if (validString(checkValues)) return res.status(400).send({ status: false, message: "Filter data should not contain numbers excluding user id" })
    }

    data.isDeleted = false;

    let getFilterBooks = await Book.find(data).sort({ title: 1 }).select({ title: 1, excerpt: 1, userId: 1, category: 1, reviews: 1, releasedAt: 1 });

    if (getFilterBooks.length == 0) return res.status(404).send({ status: false, message: "No books found" });
    res.status(200).send({ status: true, count: getFilterBooks.length, message: "Books list", data: getFilterBooks });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message })
  }
}



// GET /books/:bookId
const getBookById = async (req, res) => {
  try {
    let bookId = req.params.bookId;

    // validate ObjectId by path params
    if (!isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "Enter a valid book id" });

    // findById bookId form bookModel
    let getBook = await Book.findById(bookId).select({ __v: 0 }).lean()
    if (!getBook) return res.status(404).send({ status: false, message: "No book found" })

    if (getBook.isDeleted == true) return res.status(404).send({ status: false, message: "Book not found or have already been deleted" })

    let getReviews = await Review.find({ bookId: getBook._id, isDeleted: false }).select({ isDeleted: 0, __v: 0, createdAt: 0, updatedAt: 0 });

    getBook.reviewsData = getReviews

    res.status(200).send({ status: true, count: getReviews.length, message: "Books list", data: getBook })
  } catch (err) {
    res.status(500).send({ status: false, message: err.message })
  }
}

// PUT /books/:bookId
const updateBook = async (req, res) => {
  try {
    let bookId = req.params.bookId

    let checkBookId = await Book.findById(bookId);
    if (!checkBookId) return res.status(404).send({ status: false, message: "Book not found" });

    if (checkBookId.isDeleted == true) return res.status(404).send({ status: false, message: "Book not found or might have been deleted" });

    let data = req.body;

    // validate the body
    if (isValidBody(data)) return res.status(400).send({ status: false, message: "Data is required to update document" });

    // check releasedAt
    if (!data.releasedAt) {
      return res.status(400).send({ status: false, message: "ReleasedAt date is required" })
    }

    if (data.hasOwnProperty('userId') || data.hasOwnProperty('reviews') || data.hasOwnProperty('isDeleted') || data.hasOwnProperty('deletedAt')) return res.status(400).send({ status: false, message: 'Action is Forbidden' });

    if (data.hasOwnProperty('title')) {
      let checkUniqueValue = await Book.findOne({ title: data.title })

      if (checkUniqueValue) return res.status(400).send({ status: false, message: "Title already exist" })
    }
    if (data.hasOwnProperty('ISBN')) {
      if (validISBN(data.ISBN)) {
        return res.status(400).send({ status: false, message: "Enter a valid ISBN number" })
      }
      let checkUniqueValue = await Book.findOne({ ISBN: data.ISBN })

      if (checkUniqueValue) return res.status(400).send({ status: false, message: "ISBN already exist" })
    }

    if (validString(data.excerpt) || validString(data.category) || validString(data.subcategory)) {
      return res.status(400).send({ status: false, message: "Data should not contain Numbers" })
    }

    if (validDate(data.releasedAt)) {
      return res.status(400).send({ status: false, message: "Enter a valid released date in (YYYY-MM-DD) formate" })
    }

    let updatedBookData = await Book.findByIdAndUpdate(
      { _id: bookId },
      data,
      { new: true }
    )
    res.send({ status: true, message: "Success", data: updatedBookData })

  } catch (err) {
    res.status(500).send({ status: false, message: err.message })
  }
}

// DELETE /books/:bookId
const deleteBook = async function (req, res) {
  try {
    const bookId = req.params.bookId;
    const book = await Book.findById(bookId);

    // check Book
    if (!book) {
      return res.status(404).send({ status: false, message: "No such book exists" });
    }
    if (book.isDeleted == true) {
      return res.status(404).send({ status: false, message: "Book not found or has already been deleted" })
    }

    await Book.updateOne({ _id: bookId }, { isDeleted: true, deletedAt: Date.now(), reviews: 0 });
    await Review.updateMany({ bookId: bookId }, { isDeleted: true })
    res.status(200).send({ status: true, message: "Book deleted successfully" });
  }
  catch (err) {
    res.status(500).send({ status: false, error: err.message })
  }
}


module.exports = { getFilteredBooks, getBookById, createBook, updateBook, deleteBook};
