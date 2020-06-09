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
    if (!findMail) {
      next();
    } else {
      return res.json('This mail is already created');
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  checkIfLoggedIn,
  checkUsernameAndPasswordNotEmpty,
  checkTheLengthOfPassword,
  checkIfMailExists,
};
