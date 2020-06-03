/* eslint-disable no-else-return */
/* eslint-disable no-underscore-dangle */
const express = require('express');
const bcrypt = require('bcrypt');

const { checkIfMailExists, checkIfLoggedIn } = require('../middlewares/midAuth');

const User = require('../models/User');
const Company = require('../models/Company');
const Booking = require('../models/Booking');
const Establishment = require('../models/Establishment');

const bcryptSalt = 10;

const router = express.Router();

router.use(checkIfLoggedIn);

// show the info of User only by his mail
router.get('/by-mail/:mail', async (req, res, next) => {
  const { mail } = req.params;
  try {
    const getUser = await User.findOne({mail});
    return res.json(getUser);
  } catch (error) {
    console.log(error);
  }
});

// show the info of User
router.get('/:idUser', async (req, res, next) => {
  const { idUser } = req.params;
  try {
    const getUser = await User.findById(idUser);
    return res.json(getUser);
  } catch (error) {
    console.log(error);
  }
});

// otro para saber si yo soy yo y me puedo eliminar.
checkIfMailExists,
router.put('/:idUser/update',  async (req, res, next) => {
  const {
    name, years, mail, currentPassword, newPassword,
  } = req.body;
  console.log(req.body)
  const IDuser = req.session.currentUser._id;
  console.log("currentPasword", currentPassword)
  try {
    const updateDataUser = await User.findByIdAndUpdate({ _id: IDuser }, { name, years, mail });
    console.log(updateDataUser)
    if (!currentPassword || !newPassword) {
      return res.json(updateDataUser);
    } else {
      if (newPassword.length < 6) {
        res.json('The password requires at least 6 characters');
      }
      if (bcrypt.compareSync(currentPassword, updateDataUser.hashedPassword)) {
        const salt = bcrypt.genSaltSync(bcryptSalt);
        const newUserPassword = bcrypt.hashSync(newPassword, salt);
        const changeUserPassword = await User.findByIdAndUpdate(
          { _id: IDuser }, { hashedPassword: newUserPassword },
        );
        res.json('Password and data updated');
      } else {
        res.json('Incorrect password');
      }
    }
  } catch (error) {
    console.log(error);
  }
});

router.delete('/delete', async (req, res, next) => {
  const idUser = req.session.currentUser._id;
  console.log(idUser);
  try {
    const deleteUser = await User.findByIdAndDelete(idUser);
    const deleteIfIsOwnerOfCompany = await Company.updateMany(
      { $pull: { owners: idUser } },
    );
    if (deleteIfIsOwnerOfCompany.nModified > 0) {
      const deleteCompanyIfNotHaveOwner = await Company.deleteMany(
        { owners: { $exists: true, $size: 0 } },
      );
      //Darle una vuelta de tuerca a la siguiente iteraccion:
      const deleteEstablishments = await Establishment.deleteMany(
        { owners: { $exists: true, $size: 0 } },
      );
    }
    const deleteFromEstablishments = await Establishment.updateMany(
      { $or: [{ clients: idUser }, { owners: idUser }] },
      { $pull: { owners: idUser, clients: idUser } },
    );
    const deleteBookingsOfUserRemoved = await Booking.deleteMany({ idUser });
    req.session.destroy();
    return res.json(deleteUser);
  } catch (error) {
    console.log(error);
  }
});


module.exports = router;
