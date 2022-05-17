const mongoose = require("mongoose")

const isValid = function (value) {
  if (typeof value === 'undefined' || value === null) return false
  if (typeof value === 'string' && value.trim().length === 0) return false
  return true;
}

const isValidObjectType = (value) => {
  if (typeof value === 'object' && Object.keys(value).length > 0) {
    return false;
  } else {
    return true;
  }
}

const  isValidBody = (object) => {
  if (Object.keys(object).length > 0) {
    return false
  } else {
    return true;
  }
};

const validTitle = (Title) => {
  let correctTitle = ["Mr", "Mrs", "Miss"];
  if (correctTitle.includes(Title)) {
    return false
  } else {
    return true;
  };
};

const validString = (String) => {
  if (/\d/.test(String)) {
    return true
  } else {
    return false;
  };
};

const validMobileNum = (Mobile) => {
  if (/^[6-9]\d{9}$/.test(Mobile)) {
    return false
  } else {
    return true;
  };
};

const validEmail = (Email) => {
  if (/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(Email)) {
    return false
  } else {
    return true;
  }

};

const validPwd = (Password) => {
  if (/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(Password)) {
    return false
  } else {
    return true;
  }
};

const isValidObjectId = (objectId) => {
  return mongoose.Types.ObjectId.isValid(objectId)
};

const validDate = (date) => { //Check (/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/) ==> sample
  if(/((18|19|20)[0-9]{2}[\-.](0[13578]|1[02])[\-.](0[1-9]|[12][0-9]|3[01]))|(18|19|20)[0-9]{2}[\-.](0[469]|11)[\-.](0[1-9]|[12][0-9]|30)|(18|19|20)[0-9]{2}[\-.](02)[\-.](0[1-9]|1[0-9]|2[0-8])|(((18|19|20)(04|08|[2468][048]|[13579][26]))|2000)[\-.](02)[\-.]29/.test(date)) {
    return false;
  }else {
    return true;
  }
}

const validISBN = function (value) {
  if (!(/^(?:ISBN(?:-1[03])?:? )?(?=[-0-9 ]{17}$|[-0-9X ]{13}$|[0-9X]{10}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?(?:[0-9]+[- ]?){2}[0-9X]$/.test(value.trim()))) {
    return false
  }
  return true
};

module.exports = { isValid, isValidObjectType, isValidBody, validTitle, validString, validMobileNum, validEmail, validPwd, isValidObjectId, validDate, validISBN };
