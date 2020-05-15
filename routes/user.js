/* eslint-disable no-else-return */
/* eslint-disable no-underscore-dangle */
const express = require('express');
const bcrypt = require('bcrypt');

const { checkIfLoggedIn } = require('../middlewares/midAuth');
const { checkIfUserIsOwnerOfCompany } = require('../middlewares/midCompany');
const {
  checkIfUserIsOwnerOfCompanyForCreateEstablishments, checkIfUserIsOwnerEstablishment,
} = require('../middlewares/midEstablishment');
const { checkIfMailExists } = require('../middlewares/midUser');

const User = require('../models/User');
const Company = require('../models/Company');
const Booking = require('../models/Booking');
const Establishment = require('../models/Establishment');

const bcryptSalt = 10;

const router = express.Router();

router.use(checkIfLoggedIn);

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
router.put('/:idUser/update', checkIfMailExists, async (req, res, next) => {
  const {
    name, years, mail, currentPassword, newPassword,
  } = req.body;
  const IDuser = req.session.currentUser._id;
  try {
    const updateDataUser = await User.findByIdAndUpdate({ _id: IDuser }, { name, years, mail });
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

// router.delete('/remove', async (req, res, next) => {
//   const idUser = req.session.currentUser._id;
//   console.log(idUser)
//   try {
//     const deleteUser = await User.findByIdAndDelete(idUser);
//     const deleteIfIsOwnerOfCompany = await Company.updateMany(
//       { $pull:  { owners: idUser },
//     );
//     const deleteFromEstablishments = await Establishment.updateMany(
//       { $or: [{ clients: idUser }, { owners: idUser }] },  { $pull:  { owners: idUser,}, { clients: idUser }},
//     );
//     const deleteBookingsOfUserRemoved = await Booking.deleteMany({ idUser });
//     req.session.destroy()
//     return res.json(deleteUser);
//   } catch (error) {
//     console.log(error)
//   }

// });


module.exports = router;
