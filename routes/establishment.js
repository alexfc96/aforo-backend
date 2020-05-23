/* eslint-disable no-underscore-dangle */
const express = require('express');
const { checkIfLoggedIn } = require('../middlewares/midAuth');
const { checkIfUserIsOwnerOfCompany } = require('../middlewares/midCompany');
const {
  checkIfHourIsAllowed, createEstablishment, checkIfUserCanBooking, checkIfUserIsOwnerOfCompanyForCreateEstablishments, checkIfNameOfEstablishmentExists, checkIfPercentIsAllowedByLaw, checkIfDurationChosedByTheUserIsAllowed, checkIfUserIsOwnerEstablishment,
} = require('../middlewares/midEstablishment');

// const User = require('../models/User');
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

//check if i have bookings
router.get('/bookings', async (req, res, next) => {
  console.log("entro bookings")
  const idUser = req.session.currentUser._id;
  try {
    const haveIBookings = await Booking
      .find({ idUser })
      .populate('idEstablishment');
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
  console.log(idCompany)
  try {
    const getEstablishmentsOfOneCompany = await Establishment.find({ company: idCompany });
    return res.json(getEstablishmentsOfOneCompany);
  } 
  catch (error) {
    console.log(error);
  }
});

// show the info of a Establishment
router.get('/:idEstablishment', async (req, res, next) => {
  const { idEstablishment } = req.params;
  try {
    const showEstablishment = await Establishment.findById(idEstablishment).populate('company owners');
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
      const deleteBookingsOfClienteRemoved = await Booking.deleteMany({ idUser: idClient }); // Revisado que si no tiene bookings aquí no da error.
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
//demomento quitamos los middlewares para probar el nuevo sistema!!: checkIfUserCanBooking, checkIfTimeChosedByTheUserIsAllowed, checkIfHourIsAllowed,
router.post('/:idEstablishment/booking', checkIfUserCanBooking, checkIfDurationChosedByTheUserIsAllowed, checkIfHourIsAllowed,  async (req, res, next) => {
  const { idEstablishment } = req.params;
  const idUser = req.session.currentUser._id;
  const { day, startHour, duration } = req.body;
  console.log('mostrar datos para hacer el boooking', req.body)
  try {
    const createBooking = new Booking({
      idUser, idEstablishment, day, startHour, duration
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
