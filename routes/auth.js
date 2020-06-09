const express = require('express');
const bcrypt = require('bcrypt');

const { checkUsernameAndPasswordNotEmpty, checkIfMailExists, checkTheLengthOfPassword } = require('../middlewares/midAuth');

const User = require('../models/User');

const bcryptSalt = 10;

const router = express.Router();

router.get('/whoami', (req, res, next) => {
  if (req.session.currentUser) {
    res.status(200).json(req.session.currentUser);
  } else {
    res.status(401).json({ code: 'unauthorized' });
  }
});

router.post('/signup', checkUsernameAndPasswordNotEmpty, checkTheLengthOfPassword, checkIfMailExists,  async (req, res, next) => {
  const { username, password, mail, name, years} = res.locals.auth;
  try {
    const user = await User.findOne({ username });
    if (user) {
      return res.status(422).json({ code: 'username-not-unique' }); // if already exists
    }
    console.log('New user ', username);
    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = await User.create({ username, hashedPassword, mail, name, years });
    req.session.currentUser = newUser;
    return res.json(newUser);
  } catch (error) {
    next(error);
  }
});

router.post('/login', checkUsernameAndPasswordNotEmpty, async (req, res, next) => {
  const { username, password } = res.locals.auth;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log("entrooo 1")
      return res.status(401).json({ code: 'not-found' });
    }
    if (bcrypt.compareSync(password, user.hashedPassword)) {
      req.session.currentUser = user;
      return res.json(user);
    } else{
      console.log("entrooo")
      return res.status(404).json({ code: 'not-found' });
    }
  } catch (error) {
    next(error);
  }
});

router.get('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      next(err);
    }
    return res.status(204).send("Logout succesfully");
  });
});

module.exports = router;
