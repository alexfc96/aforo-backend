/* eslint-disable no-underscore-dangle */
const express = require('express');
const { checkIfLoggedIn } = require('../middlewares/midAuth');
const { checkIfUserIsOwnerOfCompany } = require('../middlewares/midCompany');
const {
  checkIfHourIsAllowed, checkIfUserCanBooking, checkIfUserIsOwnerOfCompanyForCreateEstablishments, checkIfIsPossibleBook, checkIfPercentIsAllowedByLaw, checkIfTimeChosedByTheUserIsAllowed, checkIfUserIsOwnerEstablishment,
} = require('../middlewares/midEstablishment');

const User = require('../models/User');
const Company = require('../models/Company');
const Establishment = require('../models/Establishment');
const Booking = require('../models/Booking');

const router = express.Router();

router.use(checkIfLoggedIn);

// create a new Establishment
router.post('/create', checkIfUserIsOwnerOfCompanyForCreateEstablishments, checkIfPercentIsAllowedByLaw, async (req, res, next) => {
  const {
    name, capacity, description, address, company, timetable,
  } = req.body;
  try {
    const { _id: companyID, owners } = res.locals.dataCompany;
    const getCompany = await Company.findById(companyID);
    if (getCompany.shareClientsInAllEstablishments && getCompany.establishments.length > 0) {
      const oneEstablishment = getCompany.establishments[0];
      const getOneEstablishment = await Establishment.findById(oneEstablishment);
      const { clients } = getOneEstablishment;
      const newEstablishment = await Establishment.create({
        name, capacity, description, address, timetable, owners, clients, company: companyID,
      });
      const addEstablishmentToCompany = await Company.findOneAndUpdate(
        { _id: companyID }, { $push: { establishments: newEstablishment._id } },
      );
      return res.json(newEstablishment);
    }
    const newEstablishment = await Establishment.create({
      name, capacity, description, address, timetable, owners, company: companyID, // link to the company because is possible that the owner could have more than once company
    });
    const addEstablishmentToCompany = await Company.findOneAndUpdate( // linked establishment to the company
      { _id: companyID }, { $push: { establishments: newEstablishment._id } },
    );
    return res.json(newEstablishment);
  } catch (error) {
    console.log(error);
    return res.json('This name of establishment is already created');
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

// delete Establishment, this also delete all the bookings vinculated to the establishment
// limitado a owners de la company:
router.delete('/:idEstablishment', checkIfUserIsOwnerOfCompany, async (req, res, next) => {
  const { idEstablishment } = req.params;
  try {
    const deleteEstablishment = await Establishment.findByIdAndDelete(idEstablishment);
    const { _id: establishmentId, company } = deleteEstablishment;
    const deleteEstablishmentOfCompany = await Company.findOneAndUpdate(
      { _id: company }, { $pull: { establishments: establishmentId } },
    );
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
        const addClientToAllEstablishments = await Establishment.updateMany(
          { _id: { $in: getCompany.establishments } }, { $push: { clients: idClient } },
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
  console.log(req.params);
  try {
    const infoEstablishment = await Establishment.findById(idEstablishment);
    if (infoEstablishment.clients.includes(idClient)) {
      const removeClientOfEstablishment = await Establishment.findOneAndUpdate(
        { _id: idEstablishment }, { $pull: { clients: idClient } },
      );
      const deleteBookingsOfClienteRemoved = await Booking.deleteMany({ idUser: idClient }); // Revisado que si no tiene bookings aquí no da error.
      return res.json(removeClientOfEstablishment);
    }
    return res.json('This user is not client of this establishment');
  } catch (error) {
    console.log(error);
  }
});

// join owner to establishment
// limitado a owners de la company:
router.post('/:idEstablishment/join-owner/:idOwner', checkIfUserIsOwnerOfCompany, async (req, res, next) => {
  const { idEstablishment, idOwner } = req.params;
  console.log(req.params);
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

// remove owner of establishment
// limitado a owners de la company:
router.delete('/:idEstablishment/remove-owner/:idowner', checkIfUserIsOwnerOfCompany, async (req, res, next) => {
  const { idEstablishment, idowner } = req.params;
  try {
    const infoEstablishment = await Establishment.findById(idEstablishment);
    if (infoEstablishment.owners.includes(idowner)) {
      const removeownerOfEstablishment = await Establishment.findOneAndUpdate(
        { _id: idEstablishment }, { $pull: { owners: idowner } },
      );
      const deleteBookingsOfOwners = await Booking.deleteMany({ idUser: idowner });
      return res.json(removeownerOfEstablishment);
    }
    return res.json('This user is not owner of this establishment');
  } catch (error) {
    console.log(error);
  }
});

// book hour in establishment
// cuando recibamos dates volver a mirar el middleware  checkIfIsPossibleBook,
router.post('/:idEstablishment/booking', checkIfUserCanBooking, checkIfTimeChosedByTheUserIsAllowed, checkIfHourIsAllowed, async (req, res, next) => {
  const { idEstablishment } = req.params;
  const idUser = req.session.currentUser._id;
  const { startTime, endingTime } = req.body;
  try {
    const createBooking = await Booking.create({
      idUser, idEstablishment, startTime, endingTime,
    });
    return res.json(createBooking);
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
