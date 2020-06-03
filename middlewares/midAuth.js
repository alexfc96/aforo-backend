/* eslint-disable no-underscore-dangle */
const User = require('../models/User');

const checkIfLoggedIn = (req, res, next) => {
  if (req.session.currentUser) {
    next();
  } else {
    res.status(401).json({ code: 'unauthorized' });
  }
};

const checkUsernameAndPasswordNotEmpty = (req, res, next) => {
  const { username, password, mail } = req.body;

  if (username !== '' && password !== '' && mail!== '') {
    res.locals.auth = req.body;
    next();
  } else {
    res.status(422).json({ code: 'validation' });
  }
};

//MIRAR ESTOO
// const checkIsIfMail = async (req, res, next) => {
//   const { mail } = req.body;
//   try {
//     if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/(mail)) {
//       console.log("mail correcto")
//       next();
//     } else {
//       return res.json('Email format incorrect');
//     }
//   } catch (error) {
//     console.log(error);
//   }
// };

const checkTheLengthOfPassword = (req, res, next) => {
  const { password } = req.body;
  try {
    if (password.length>5) {
      next();
    } else {
      return res.json('The password requires at least 6 characters');
    }
  } catch (error) {
    console.log(error);
  }
}

const checkIfMailExists = async (req, res, next) => {
  const { mail } = req.body;
  try {
    const findMail = await User.findOne({ mail });
    // console.log(findMail);
    if (!findMail) {
      next();
    } else {
      return res.json('This mail is already created');//poner statuss
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  checkIfLoggedIn,
  checkUsernameAndPasswordNotEmpty,
  // checkIsIfMail,
  checkTheLengthOfPassword,
  checkIfMailExists,
};
