/* eslint-disable no-underscore-dangle */
const express = require('express');
const { checkIfLoggedIn } = require('../middlewares');

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
router.get('/:_id', async (req, res, next) => {
  const idcompany = req.params;
  try {
    const showCompany = await Company.findById(idcompany);
    return res.json(showCompany);
  } catch (error) {
    console.log(error);
  }
});

// delete company, this also delete the establishments vinculated, and this also delete the bookings of this establishments
router.delete('/:_id', async (req, res, next) => {
  const idcompany = req.params;
  try {
    const deleteCompany = await Company.findByIdAndDelete(idcompany);
    const deleteEstablishments = await Establishment.deleteMany({ company: idcompany });
    deleteCompany.establishments.forEach(async (establishment) => {  //foreach no devuelve promise por lo que hay que llamar al async para poder utilizarlo
      await Booking.deleteMany({ idEstablishment: establishment });
    });
    return res.json(deleteCompany);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;


// res.status(200).json({
// 	demo: 'Welcome this route is protected',
// });
