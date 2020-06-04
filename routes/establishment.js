/* eslint-disable no-underscore-dangle */
const express = require('express');
const { checkIfLoggedIn } = require('../middlewares/midAuth');
const { checkIfUserIsOwnerOfCompany } = require('../middlewares/midCompany');
const {
  checkIfHourIsAllowed, createEstablishment, checkIfUserCanBooking, checkIfUserIsOwnerOfCompanyForCreateEstablishments, checkIfNameOfEstablishmentExists, checkIfPercentIsAllowedByLaw, checkIfDurationChosedByTheUserIsAllowed, checkIfUserIsOwnerEstablishment,
  checkIfIsPossibleBook, orderByDate, orderByDateReverse } = require('../middlewares/midEstablishment');

const User = require('../models/User');
const Company = require('../models/Company');
const Establishment = require('../models/Establishment');
const Booking = require('../models/Booking');

const router = express.Router();

router.use(checkIfLoggedIn);

// res.status(200).json({
// 	demo: 'Welcome this route is protected',
// });

//check if i have or i am joined in a company
router.get('/establishments', async (req, res, next) => {
  const idUser = req.session.currentUser._id;
  try {
    const amIaClientOfEstablishment = await Establishment.find(
      { $or: [{ clients: idUser }, { owners: idUser }] }
      ).populate('company');
    return res.json(amIaClientOfEstablishment);
  } 
  catch (error) {
    console.log(error);
  }
});

//get all the bookings bookings
router.get('/all-bookings', async (req, res, next) => {
  const idUser = req.session.currentUser._id;
  try {
    const haveIBookings = await Booking
      .find({ idUser })
      .populate('idEstablishment');
    
    await orderByDate(haveIBookings);
    return res.json(haveIBookings);
  } 
  catch (error) {
    console.log(error);
  }
});

//check if i have current bookings
router.get('/bookings', async (req, res, next) => {
  const idUser = req.session.currentUser._id;
  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
  try {
    const haveIBookings = await Booking
      .find({ day: { $gte: yesterday }, idUser })
      .populate('idEstablishment');
    
    await orderByDate(haveIBookings);
    return res.json(haveIBookings);
  } 
  catch (error) {
    console.log(error);
  }
});

//check if i have OLD bookings
router.get('/old-bookings', async (req, res, next) => {
  const idUser = req.session.currentUser._id;
  const today = new Date(new Date().setDate(new Date().getDate()));
  try {
    const haveIBookings = await Booking
      .find({ day: { $lte: today }, idUser })
      .populate('idEstablishment');
    
    await orderByDateReverse(haveIBookings);
    console.log("sorted",haveIBookings)
    return res.json(haveIBookings);
  } 
  catch (error) {
    console.log(error);
  }
});

// create a new Establishment
//falta el checkIfNameOfEstablishmentExists,
router.post('/create', checkIfUserIsOwnerOfCompanyForCreateEstablishments, checkIfPercentIsAllowedByLaw, async (req, res, next) => {
  const { _id: companyID } = res.locals.dataCompany;
  console.log("sigo vivo")
  try {
    const getCompany = await Company.findById(companyID);
    const getEstablishmentWithTheSameCompany = await Establishment.find({company:getCompany._id})
    if (getCompany.shareClientsInAllEstablishments && getEstablishmentWithTheSameCompany.length > 0) {
      const getOneEstablishment = await Establishment.findOne({company:getCompany._id});
      const { clients } = getOneEstablishment;
      const newEstablishment = await createEstablishment(req.body, res.locals.dataCompany, clients);
      return res.json(newEstablishment);
    }
    const newEstablishment = await createEstablishment(req.body, res.locals.dataCompany);
    return res.json(newEstablishment);
  } catch (error) {
    return res.json(error);
    console.log(error);
  }
});

//give the establishments associated to company
router.get('/by-company/:idCompany', async (req, res, next) => {
  const { idCompany } = req.params;
  try {
    const getEstablishmentsByIdCompany = await Establishment.find({ company: idCompany });
    return res.json(getEstablishmentsByIdCompany);
  } 
  catch (error) {
    console.log(error);
  }
});

//give the establishments associated by name
router.post('/by-name', async (req, res, next) => {
  const { input } = req.body;
  try {
    const getEstablishmentsByName = await Establishment.find({ name: new RegExp(input, 'i') });
    return res.json(getEstablishmentsByName);
  } 
  catch (error) {
    console.log(error);
  }
});

//give the bookings associated to a establishment in one determinate day
router.post('/get-bookings-by-day/:idEstablishment', async (req, res, next) => {
  const { idEstablishment } = req.params;
  const { day } = req.body;
  const dateParsed = new Date(day)
  // console.log("date parsed", dateParsed)
  try {
    const findBookingsByDay = await Booking.find({ day: dateParsed, idEstablishment})//encontramos los que coinciden.
    // console.log(findBookingsByDay)
    return res.json(findBookingsByDay);
  } 
  catch (error) {
    console.log(error);
  }
});

//give the users associated to a establishment in one determinate session
router.post('/:idEstablishment/get-users-of-session', async (req, res, next) => {
  const { idEstablishment } = req.params;
  const { session } = req.body;
  try {
    const findBookingsBySession = await Booking.find({ startHour: session, idEstablishment}).populate('idUser');
    return res.json(findBookingsBySession);
  } 
  catch (error) {
    console.log(error);
  }
});

// show the info of a Establishment
router.get('/:idEstablishment', async (req, res, next) => {
  const { idEstablishment } = req.params;
  try {
    const showEstablishment = await Establishment.findById(idEstablishment).populate('company owners clients');
    return res.json(showEstablishment);
  } catch (error) {
    console.log(error);
  }
});

// admin data establishment
router.put('/:idEstablishment/admin', checkIfUserIsOwnerEstablishment, checkIfPercentIsAllowedByLaw, async (req, res, next) => {
  const { idEstablishment } = req.params;
  const {
    name, capacity, description, address, timetable,
  } = req.body;
  try {
    const modifyEstablishment = await Establishment.findByIdAndUpdate(
      { _id: idEstablishment }, {
        name, capacity, description, address, timetable,
      },
    );
    return res.json(modifyEstablishment);
  } catch (error) {
    console.log(error);
  }
});

// delete Establishment, this also delete all the bookings vinculated to the establishment(only for owners of company)
router.delete('/:idEstablishment', checkIfUserIsOwnerOfCompany, async (req, res, next) => {
  const { idEstablishment } = req.params;
  try {
    const deleteEstablishment = await Establishment.findByIdAndDelete(idEstablishment);
    const { _id: establishmentId } = deleteEstablishment;
    const deleteBookingsOfEstablishment = await Booking.deleteMany(
      { idEstablishment: establishmentId },
    );
    return res.json(deleteEstablishment);
  } catch (error) {
    console.log(error);
  }
});

// join clients to establishment
router.post('/:idEstablishment/join-client/:idClient', checkIfUserIsOwnerEstablishment, async (req, res, next) => {
  const { idEstablishment, idClient } = req.params;
  try {
    const infoEstablishment = await Establishment.findById(idEstablishment);
    if (!infoEstablishment.clients.includes(idClient)) {
      const getCompany = await Company.findById(infoEstablishment.company);
      if (getCompany.shareClientsInAllEstablishments) {
        const getEstablishmentWithTheSameCompany = await Establishment.find({company:infoEstablishment.company})
        console.log("all the establisghments of the company", getEstablishmentWithTheSameCompany )
        const addClientToAllEstablishments = await Establishment.updateMany(
          { _id: { $in: getEstablishmentWithTheSameCompany } }, { $push: { clients: idClient } },
        );
        return res.json(addClientToAllEstablishments);
      }
      const addClientToEstablishment = await Establishment.findOneAndUpdate(
        { _id: idEstablishment }, { $push: { clients: idClient } },
      );
      return res.json(addClientToEstablishment);
    }
    return res.json('This user is already suscribed');
  } catch (error) {
    console.log(error);
  }
});

// remove clients of establishment
router.delete('/:idEstablishment/remove-client/:idClient', checkIfUserIsOwnerEstablishment, async (req, res, next) => { // creo que aquí hará falta poner otra query con el id del cliente que queremos tratar.
  const { idEstablishment, idClient } = req.params;
  try {
    const infoEstablishment = await Establishment.findById(idEstablishment);
    if (infoEstablishment.clients.includes(idClient)) {
      const removeClientOfEstablishment = await Establishment.findOneAndUpdate(
        { _id: idEstablishment }, { $pull: { clients: idClient } },
      );
      const deleteBookingsOfClienteRemoved = await Booking.deleteMany({ idUser: idClient, idEstablishment }); // Revisado que si no tiene bookings aquí no da error.
      const selectUser = await User.findById(idClient);
      if (selectUser.favoriteEstablishments.includes(idEstablishment)) {
        const removeEstablishmentOnFavorites = await User.findOneAndUpdate(
          { _id: idClient }, { $pull: { favoriteEstablishments: idEstablishment } },
        );
        // return res.json(removeEstablishmentOnFavorites);
      }
      return res.json(removeClientOfEstablishment);
    }
    return res.json('This user is not client of this establishment');
  } catch (error) {
    console.log(error);
  }
});

// join owner to establishment(only for owners of company)
router.post('/:idEstablishment/join-owner/:idOwner', checkIfUserIsOwnerOfCompany, async (req, res, next) => {
  const { idEstablishment, idOwner } = req.params;
  try {
    const infoEstablishment = await Establishment.findById(idEstablishment);
    if (!infoEstablishment.owners.includes(idOwner)) {
      const addOwnerToEstablishment = await Establishment.findOneAndUpdate(
        { _id: idEstablishment }, { $push: { owners: idOwner } },
      );
      return res.json(addOwnerToEstablishment);
    }
    return res.json('This user is already owner');
  } catch (error) {
    console.log(error);
  }
});

// remove owner of establishment(only for owners of company)
router.delete('/:idEstablishment/remove-owner/:idowner', checkIfUserIsOwnerOfCompany, async (req, res, next) => {
  const { idEstablishment, idowner } = req.params;
  try {
    const infoEstablishment = await Establishment.findById(idEstablishment);
    if (infoEstablishment.owners.includes(idowner)) {
      const removeownerOfEstablishment = await Establishment.findOneAndUpdate(
        { _id: idEstablishment }, { $pull: { owners: idowner } },
      );
      const deleteBookingsOfOwners = await Booking.deleteMany({ idUser: idowner, idEstablishment });
      const selectUser = await User.findById(idowner);
      if (selectUser.favoriteEstablishments.includes(idEstablishment)) {
        const removeEstablishmentOnFavorites = await User.findOneAndUpdate(
          { _id: idowner }, { $pull: { favoriteEstablishments: idEstablishment } },
        );
        // return res.json(removeEstablishmentOnFavorites);
      }
      return res.json(removeownerOfEstablishment);
    }
    return res.json('This user is not owner of this establishment');
  } catch (error) {
    console.log(error);
  }
});

// book hour in establishment
// cuando recibamos dates volver a mirar el middleware  checkIfIsPossibleBook,
//al quitar el duration para las pruebas quittamos el middleware , checkIfHourIsAllowed, checkIfDurationChosedByTheUserIsAllowed
router.post('/:idEstablishment/booking', checkIfUserCanBooking, checkIfHourIsAllowed, checkIfIsPossibleBook, async (req, res, next) => {
  const { idEstablishment } = req.params;
  const idUser = req.session.currentUser._id;
  const { day, startHour } = req.body;
  // console.log('mostrar datos para hacer el boooking', req.body)
  try {
    const createBooking = new Booking({
      idUser, idEstablishment, day, startHour
    });
    const newBooking = await createBooking.save()
    return res.json(newBooking);
  } catch (error) {
    console.log(error);
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

//put the establishment in the favourites of the user(only if you are user)
router.post('/:idEstablishment/favorite', checkIfUserCanBooking,  async (req, res, next) => {
  const { idEstablishment } = req.params;
  const idUser = req.session.currentUser._id;
  try {
    const selectUser = await User.findById(idUser);
    if (!selectUser.favoriteEstablishments.includes(idEstablishment)) {
      const addEstablishmentOnFavorites = await User.findOneAndUpdate(
        { _id: idUser }, { $push: { favoriteEstablishments: idEstablishment } },
      );
      return res.json(addEstablishmentOnFavorites);
    }
  } catch (error) {
    console.log(error);
  }
});

//delete the establishment of the favourites of the user
router.post('/:idEstablishment/remove-favorite',  async (req, res, next) => {
  const { idEstablishment } = req.params;
  const idUser = req.session.currentUser._id;
  try {
    const selectUser = await User.findById(idUser);
    if (selectUser.favoriteEstablishments.includes(idEstablishment)) {
      const removeEstablishmentOnFavorites = await User.findOneAndUpdate(
        { _id: idUser }, { $pull: { favoriteEstablishments: idEstablishment } },
      );
      return res.json(removeEstablishmentOnFavorites);
    }
  } catch (error) {
    console.log(error);
  }
});

// delete booking in establishment
router.delete('/:idEstablishment/delete-booking/:idBooking', async (req, res, next) => {
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
