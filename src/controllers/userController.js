const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { isValidBody, isValidObjectType, validTitle, validString, validMobileNum, validEmail, validISBN, validPwd } = require("../utils/validation");




//    Post/Register  //


const createUser = async (req, res) => {

  try {

    let data = req.body;

    //Validate the Body

    if (isValidBody(data)) {
      return res.status(400).send({ status: false, message: "Enter user details" });
    }

    //check the title  

    if (!data.title) {
      return res.status(400).send({ status: false, message: "Title is required" });
    }

    //check the name
    if (!data.name) {
      return res.status(400).send({ status: false, message: "Name is required" });
    }

    //check the Phone

    if (!data.phone) {
      return res.status(400).send({ status: false, message: "Mobile number is required" });
    }

    //check the email

    if (!data.email) {
      return res.status(400).send({ status: false, message: "Email ID is required" });
    }

    //check the password

    if (!data.password) {
      return res.status(400).send({ status: false, message: "Password is required" });
    }

    //Validate the title

    if (validTitle(data.title)) {
      return res.status(400).send({ status: false, message: "Title should be one of Mr, Mrs or Miss" });
    }

    //Validate  the name

    if (validString(data.name)) {
      return res.status(400).send({ status: false, message: "Name should be valid and should not contains any numbers" });
    }

    //Validate the mobile number

    if (validMobileNum(data.phone)) {
      return res.status(400).send({ status: false, message: "Enter a valid phone number" });
    }

    //Validate the email

    if (validEmail(data.email)) {
      return res.status(400).send({ status: false, message: "Enter a valid email-id" });
    }

    //Validate the password

    if (validPwd(data.password)) {
      return res.status(400).send({ status: false, message: "Password should be 8-15 characters long and must contain one of 0-9,A-Z,a-z and special characters" });
    }

    if(data.hasOwnProperty('address')){
      if(isValidObjectType(data.address)) return res.status(400).send({ status: false, message: "Enter address in a object with 'street','city' and 'pincode' as keys"})
    }


    // Checking duplicate Entry Of User email 
    let duplicateEmail = await User.findOne({ email: data.email });

    if (duplicateEmail) {
        return res.status(400).send({ status: false, message: "User email-Id already exists" });
    }

    // Checking duplicate Entry Of User phone number
    let duplicatePhone = await User.findOne({ phone: data.phone });

    if (duplicatePhone) {
        return res.status(400).send({ status: false, message: "User phone number already exists" });
    }

    //Password Encryption 

    data.password = await bcrypt.hash(data.password, 10);


    // Finally the registration of User is successful

    let userData = await User.create(data);

    res.status(201).send({ status: true, message: "User created successfully", data: userData });

  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }

};



//    Post/login  //



const userLogin = async function (req, res) {
  try {

    let data = req.body;

    //Validate the body

    if (isValidBody(data)) {
      return res.status(400).send({ status: false, message: "Enter user details" });
    }

    //Check the email

    if (!data.email) {
      return res.status(400).send({ status: false, message: "Email ID is required" });
    }

    //check the password

    if (!data.password) {
      return res.status(400).send({ status: false, message: "Password is required" });
    }

    //Validate the email

    if (validEmail(data.email)) {
      return res.status(400).send({ status: false, message: "Enter a valid email-id" });
    }

    //Validate the password

    if (validPwd(data.password)) {
      return res.status(400).send({ status: false, message: "Enter a valid password" });
    }

    //Email check

    const checkValidUser = await User.findOne({ email: data.email });

    if (!checkValidUser) {
      return res.status(401).send({ status: false, message: "Email Id is not correct " });
    }

    //Password check

    let checkPassword = await bcrypt.compare(data.password, checkValidUser.password);

    if (!checkPassword) {
      return res.status(401).send({ status: false, message: "Password is not correct" });
    }

    // token generation for the logged in user 

    let token = jwt.sign({ userId: checkValidUser._id }, "Books-Management", {expiresIn: '1d'});

    //set token to the header

    res.setHeader('x-api-key', token);

    res.status(200).send({ status: true, message: "Successfully Login", data: token });

  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { createUser, userLogin };
