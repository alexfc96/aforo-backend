/* eslint-disable no-underscore-dangle */
const express = require('express');
const { checkIfLoggedIn, checkIfHourIsAllowed, checkIfTimeChosedByTheUserIsAllowed } = require('../middlewares');

const User = require('../models/User');
const Company = require('../models/Company');
const Establishment = require('../models/Establishment');
const Booking = require('../models/Booking');

const router = express.Router();

router.use(checkIfLoggedIn);

// create a new Establishment
router.post('/create', async (req, res, next) => {
  const IDowner = req.session.currentUser._id;
  const {
    name, capacity, description, address, company, timetable,
  } = req.body;

  try {
    const owner = await User.findById(IDowner);
    const findCompanyByName = await Company.findOne( // buscamos la compañia que ha seleccionado el admin para vincular el establishment
      { name: company },
    );
    const companyID = findCompanyByName._id;
    const newEstablishment = await Establishment.create({
      name, capacity, description, address, timetable, owners: owner, company: companyID, // tambien metemos el link a company (necesario?)
    });
    const addEstablishmentToCompany = await Company.findOneAndUpdate( // y vinculamos este establishment a la company
      { _id: companyID }, { $push: { establishments: newEstablishment._id } },
    );
    return res.json(newEstablishment);
  } catch (error) {
    console.log(error);
  }
});

// show the info of a Establishment
router.get('/:idEstablishment', async (req, res, next) => {
  const { idEstablishment } = req.params;
  try {
    const showEstablishment = await Establishment.findById(idEstablishment);
    // .populate('establishments');
    return res.json(showEstablishment);
  } catch (error) {
    console.log(error);
  }
});

// delete Establishment, this also delete all the bookings vinculated to the establishment
router.delete('/:idEstablishment', async (req, res, next) => {
  const { idEstablishment } = req.params;
  try {
    const deleteEstablishment = await Establishment.findByIdAndDelete(idEstablishment);
    const { _id: establishmentId, company } = deleteEstablishment;
    const deleteEstablishmentOfCompany = await Company.findOneAndUpdate(
      { _id: company }, { $pull: { establishments: establishmentId } },
    );
    const deleteBookingsOfEstablishment = await Booking.deleteMany({ idEstablishment: establishmentId });
    return res.json(deleteEstablishment);
  } catch (error) {
    console.log(error);
  }
});

// join clients to establishment
router.post('/:idEstablishment/join-client', async (req, res, next) => {
  const { idEstablishment } = req.params;
  const idUser = req.session.currentUser._id;
  try {
    const infoEstablishment = await Establishment.findById(idEstablishment);
    if (!infoEstablishment.clients.includes(idUser)) {
      const addClientToEstablishment = await Establishment.findOneAndUpdate(
        { _id: idEstablishment }, { $push: { clients: idUser } },
      );
      return res.json(addClientToEstablishment);
    }
    return res.json('This user is already suscribed');
  } catch (error) {
    console.log(error);
  }
});

// join owner to establishment
// pensar medidas de seguridad. X ejemplo que solo si eres owner de la company puedes pasar a seer owner de los stablishments? No me gusta.
router.post('/:idEstablishment/join-owner', async (req, res, next) => {
  const { idEstablishment } = req.params;
  const idUser = req.session.currentUser._id;
  try {
    const infoEstablishment = await Establishment.findById(idEstablishment);
    if (!infoEstablishment.owners.includes(idUser)) {
      const addOwnerToEstablishment = await Establishment.findOneAndUpdate(
        { _id: idEstablishment }, { $push: { owners: idUser } },
      );
      return res.json(addOwnerToEstablishment);
    }
    return res.json('This user is already owner');
  } catch (error) {
    console.log(error);
  }
});

// book hour in establishment
router.post('/:idEstablishment/booking', checkIfTimeChosedByTheUserIsAllowed, checkIfHourIsAllowed, async (req, res, next) => { // cuidado con el orden de las rutas(si no tira)
  const { idEstablishment } = req.params;
  const idUser = req.session.currentUser._id;
  const { startTime, endingTime } = req.body;
  const searchUser = await Establishment.findOne({
    $or: [{ clients: idUser }, { owners: idUser }],
  });
  if (searchUser) { // restringir que solo los clientes y owners puedan hacer reservas
    try {
      const createBooking = await Booking.create({
        idUser, idEstablishment, startTime, endingTime,
      });
      return res.json(createBooking);
    } catch (error) {
      console.log(error);
    }
  } else {
    res.send('401: Unauthorized');
  }
});

// show info about one booking
router.get('/:idEstablishment/booking/:idBooking', async (req, res, next) => {
  const { idBooking } = req.params;
  try {
    const showBooking = await Booking.findById(idBooking);
    return res.json(showBooking);
  } catch (error) {
    console.log(error);
  }
});

// delete booking in establishment
router.delete('/:idEstablishment/delete-booking/:idBooking', async (req, res, next) => { // cuidado con el orden de las rutas(si no tira)
  const { idBooking } = req.params;
  // const idUser = req.session.currentUser._id;
  try {
    const deleteBooking = await Booking.findByIdAndDelete(idBooking);
    return res.json(deleteBooking);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;


// res.status(200).json({
// 	demo: 'Welcome this route is protected',
// });
