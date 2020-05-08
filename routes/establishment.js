/* eslint-disable no-underscore-dangle */
const express = require('express');
const { checkIfLoggedIn } = require('../middlewares');

const User = require('../models/User');
const Company = require('../models/Company');
const Establishment = require('../models/Establishment');
const Booking = require('../models/Booking');

const router = express.Router();

router.use(checkIfLoggedIn);

//create a new Establishment
router.post('/create', async (req, res, next) => {
  const IDowner = req.session.currentUser._id;
  const { name, capacity, description, address, company, timetable } = req.body;

  try {
    const owner = await User.findById(IDowner);
    const findCompanyByName = await Company.findOne(  //buscamos la compañia que ha seleccionado el admin para vincular el establishment
      { name: company },
    );
    const companyID = findCompanyByName._id;
    const newEstablishment = await Establishment.create({
      name, capacity, description, address, timetable, owners: owner, company: companyID, //tambien metemos el link a company (necesario?)
    });
    const addEstablishmentToCompany = await Company.findOneAndUpdate(  //y vinculamos este establishment a la company 
      { _id: companyID }, { $push: { establishments: newEstablishment._id } },
    );
    return res.json(newEstablishment);
  } catch (error) {
    console.log(error);
  }
});

//show the info of a Establishment
router.get('/:_id', async(req, res, next) =>{
  const idEstablishment = req.params;
  try {
    const showEstablishment = await (await Establishment.findById(idEstablishment));
    //.populate('establishments');
    return res.json(showEstablishment);
  } catch (error) {
    console.log(error);
  }
});

//delete Establishment
router.delete('/:_id', async(req, res, next) =>{
  const idEstablishment = req.params;
  try {
    const deleteEstablishment = await Establishment.findByIdAndDelete(idEstablishment);
    const { _id: establishmentId, company } = deleteEstablishment;
    const deleteEstablishmentOfCompany = await Company.findOneAndUpdate(
      { _id: company }, { $pull: { establishments: establishmentId }}
    );
    return res.json(deleteEstablishment);
  } catch (error) {
    console.log(error);
  }
});

//book hour in establishment
router.post('/:_id/booking', async(req, res, next) =>{  //cuidado con el orden de las rutas(si no tira)
  const idEstablishment = req.params;
  const idUser = req.session.currentUser._id;
  const { startTime, endingTime } = req.body;

  try {
    const createBooking = await Booking.create({
      idUser, idEstablishment, startTime, endingTime,
    });
    return res.json(createBooking);
  } catch (error) {
    console.log(error)
  }

});
module.exports = router;


  // res.status(200).json({
  // 	demo: 'Welcome this route is protected',
  // });