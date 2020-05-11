/* eslint-disable no-underscore-dangle */
const express = require('express');
const { checkIfLoggedIn, checkIfUserIsOwner } = require('../middlewares');

const User = require('../models/User');
const Establishment = require('../models/Establishment');
const Company = require('../models/Company');
const Booking = require('../models/Booking');

const router = express.Router();

router.use(checkIfLoggedIn); // obliga a estar logueado
// luego tendremos que indicar que solo lo puedan hacerlo los usuarios admins.

// create a new company
router.post('/create', async (req, res, next) => {
  const IDowner = req.session.currentUser._id;
  const { name, description } = req.body;
  try {
    const owner = await User.findById(IDowner);
    const newCompany = await Company.create({
      name, description, owners: owner,
    });
    return res.json(newCompany);
  } catch (error) {
    console.log(error);
  }
});

// show the info of a company
router.get('/:idCompany', async (req, res, next) => {
  const { idCompany } = req.params;
  console.log(req.params);
  try {
    const showCompany = await Company.findById(idCompany);
    return res.json(showCompany);
  } catch (error) {
    console.log(error);
  }
});

//admin data company
router.put('/:idCompany/admin', async (req, res, next) => {
  const { idCompany } = req.params;
  const { name, description } = req.body;
  try {
    const modifyCompany = await Company.findByIdAndUpdate(
      { idCompany }, { name, description },
    );
    return res.json(modifyCompany);
  } catch (error) {
    console.log(error);
  }
});

// join owner to company
//pensar medidas de seguridad
router.post('/:idCompany/join-owner', async (req, res, next) => {
  const { idCompany } = req.params;
  const idUser = req.session.currentUser._id;
  try {
    const infoCompany = await Company.findById(idCompany);
    if (!infoCompany.owners.includes(idUser)) {
      const addOwnerToCompany = await Company.findOneAndUpdate(
        { _id: idCompany }, { $push: { owners: idUser } },
      );
      const joinNewOwnerToEstablishments = await Establishment.updateMany(
        { _id: { $in: [infoCompany.establishments] } }, { $push: { owners: idUser } },
      );
      return res.json(addOwnerToCompany);
    }
    return res.json('This user is already owner');
  } catch (error) {
    console.log(error);
  }
});

// delete company, this also delete the establishments vinculated, and this also delete the bookings of this establishments
router.delete('/:idCompany', checkIfUserIsOwner, async (req, res, next) => {
  const { idCompany } = req.params;
  try {
    const deleteCompany = await Company.findByIdAndDelete(idCompany);
    const deleteEstablishments = await Establishment.deleteMany({ company: idCompany });
    const deleteBookings = await Booking.deleteMany({
      idEstablishment: { $in: [deleteCompany.establishments] },
    });
    return res.send("Company deleted succesfully");
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;


// res.status(200).json({
// 	demo: 'Welcome this route is protected',
// });
