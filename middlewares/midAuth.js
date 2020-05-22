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
  checkIfMailExists,
};
