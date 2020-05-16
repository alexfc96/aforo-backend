/* eslint-disable no-underscore-dangle */
const express = require('express');
const { checkIfLoggedIn } = require('../middlewares/midAuth');
const { checkIfUserIsOwner } = require('../middlewares/midCompany');

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
  const { name, description, shareClientsInAllEstablishments } = req.body;
  try {
    const owner = await User.findById(IDowner);
    const newCompany = await Company.create({
      name, description, shareClientsInAllEstablishments, owners: owner,
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
router.put('/:idCompany/admin', checkIfUserIsOwner, async (req, res, next) => {
  const { idCompany } = req.params;
  const { name, description } = req.body;
  try {
    const modifyCompany = await Company.findByIdAndUpdate(
      { _id: idCompany }, { name, description },
    );
    return res.json(modifyCompany);
  } catch (error) {
    console.log(error);
  }
});

// join owner to company
//pensar medidas de seguridad
router.post('/:idCompany/join-owner/:idOwner', async (req, res, next) => {
  const { idCompany, idOwner } = req.params;
  try {
    const infoCompany = await Company.findById(idCompany);
    if (!infoCompany.owners.includes(idOwner)) {
      const addOwnerToCompany = await Company.findOneAndUpdate(
        { _id: idCompany }, { $push: { owners: idOwner } },
      );
      const setNewOwnerToEstablishments = await Establishment.updateMany(
        { _id: infoCompany.establishments }, { $push: { owners: idOwner } },
      );
      return res.json(addOwnerToCompany);
    }
    return res.json('This user is already owner');
  } catch (error) {
    console.log(error);
  }
});

// remove owner of Company
router.delete('/:idCompany/remove-owner/:idOwner', checkIfUserIsOwner, async (req, res, next) => {
  const { idCompany, idOwner } = req.params;
  try {
    const infoCompany = await Company.findById(idCompany);
    if (infoCompany.owners.includes(idOwner)) {
      const removeownerOfCompany = await Company.findOneAndUpdate(
        { _id: idCompany }, { $pull: { owners: idOwner } },
      );
      const removeownerOfEstablishments = await Establishment.updateMany(
        { _id: infoCompany.establishments }, { $pull: { owners: idOwner } },
      );
      const deleteBookingsOfOwner = await Booking.deleteMany({ idUser: idOwner }, { idEstablishment: infoCompany.establishments });
      return res.json(removeownerOfCompany);
    }
    return res.json('This user is not owner of this Company');
  } catch (error) {
    console.log(error);
  }
});

// delete company, this also delete the establishments vinculated, and this also delete the bookings of this establishments
router.delete('/:idCompany', checkIfUserIsOwner, async (req, res, next) => {
  const { idCompany } = req.params;
  try {
    const deleteCompany = await Company.findByIdAndDelete(idCompany);
    console.log(deleteCompany.establishments);
    const { establishments } = deleteCompany;
    const deleteEstablishments = await Establishment.deleteMany({ company: idCompany });
    console.log("va bien")
    const deleteBookings = await Booking.deleteMany(
      { idEstablishment: establishments },
    );
<<<<<<< HEAD
    console.log("genial")

    return res.send("Company deleted succesfully");
=======
    return res.json("Company deleted succesfully");
>>>>>>> dev
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;


// res.status(200).json({
// 	demo: 'Welcome this route is protected',
// });
