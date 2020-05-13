/* eslint-disable no-underscore-dangle */
const User = require('../models/User');

const checkIfMailExists = async (req, res, next) => {
  const { mail } = req.body;
  try {
    const findMail = await User.findOne({ mail });
    console.log(findMail);
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
  checkIfMailExists,
};