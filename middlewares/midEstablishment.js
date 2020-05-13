/* eslint-disable no-underscore-dangle */
const Establishment = require('../models/Establishment');
const Company = require('../models/Company');
require('dotenv').config();

// comprobar si el tanto por ciento de personas permitidas es menor al indicado en el .env cuando un owner de un establishment establece este campo
const checkIfPercentIsAllowedByLaw = async (req, res, next) => {
  const maximumPercentOfPeopleAllowedByLaw = process.env.MAX_PERCENT;
  const { capacity } = req.body;
  if (capacity.percentOfPeopleAllowed > maximumPercentOfPeopleAllowedByLaw) {
    res.status(422).json({ code: 'The specified percentage exceeds that stipulated by law.' });
  } else {
    next();
  }
};

// comprobar si hay espacio en el espacio de tiempo que intenta reservar el usuario
// darle una vuelta de nuevo cuando reciba date. entonces crear tantas franjas de tiempo como tiempo máximo esté permitido.
const checkIfIsPossibleBook = async (req, res, next) => {
  const { idEstablishment } = req.params;
  // const { startTime, endingTime } = req.body;

  const establishment = await Establishment.findById(idEstablishment);
  const { maximumCapacity, percentOfPeopleAllowed } = establishment.capacity;
  const percentOfUsersAllowedInTheEstablishmentInCertainTime = Math.round((maximumCapacity * percentOfPeopleAllowed) / 100);
  console.log(percentOfUsersAllowedInTheEstablishmentInCertainTime);

  const { timeAllowedPerBooking } = establishment.timetable;

  // persona y tiempo
  if (capacity.percentOfPeopleAllowed > percentOfUsersAllowedInTheEstablishmentInCertainTime) {
    res.status(422).json({ code: 'The specified percentage exceeds that stipulated by law.' });
  } else {
    next();
  }
};

// cuando tenga el front y me pasen las horas ya haremos:
const checkIfHourIsAllowed = async (req, res, next) => {
  const { startTime, endingTime } = req.body;
  const { idEstablishment } = req.params;
  try {
    const establishment = await Establishment.findById(idEstablishment);
    if (establishment) {
      // console.log('OBJETO', establishment);
      if (startTime < establishment.timetable.startHourShift || endingTime > establishment.timetable.finalHourShift) {
        // res.locals.hours = req.body;
        next();
      } else {
        res.status(422).json({ code: 'Hour selected not allowed' });
      }
    }
  } catch (error) {
    res.status(422).json({ code: 'Object fail' });
  }
};

// cuando tenga el front y me pasen las horas ya haremos:
const checkIfTimeChosedByTheUserIsAllowed = async (req, res, next) => {
  const { startTime, endingTime } = req.body;
  const totalTime = endingTime - startTime;
  const { idEstablishment } = req.params;
  try {
    const establishment = await Establishment.findById(idEstablishment);
    if (totalTime <= establishment.timetable.timeAllowedPerBooking) {
      // res.locals.hours = req.body;
      next();
    } else {
      res.status(422).json({ code: 'Incorrect time limit' });
    }
  } catch (error) {
    res.status(422).json({ code: 'Object fail' });
  }
};

// Como aprovechar esto para establishment y no tener que hacer 2 diferentes?
// control for allow delete companay only for the owners
const checkIfUserIsOwnerOfCompanyForCreateEstablishments = async (req, res, next) => {
  const IDuser = req.session.currentUser._id;
  const { company } = req.body;
  try {
    const findCompanyByName = await Company.findOne( // buscamos la compañia que ha seleccionado el admin para vincular el establishment
      { name: company },
    );
    const infoOfCompany = await Company.findById(findCompanyByName._id);
    if (infoOfCompany.owners.includes(IDuser)) {
      // console.log(infoOfCompany);
      res.locals.dataCompany = infoOfCompany;
      next();
    } else { // si no pongo el else se muestra siempre el unauthorized. Porque? el next no es como un return?
      return res.json('Unauthorized');
    }
  } catch (error) {
    console.log(error);
  }
};

// control for allow remove clients of establishments or delete the establishments only for the owners
const checkIfUserIsOwnerEstablishment = async (req, res, next) => {
  const IDuser = req.session.currentUser._id;
  const { idEstablishment } = req.params;
  try {
    const infoEstablishment = await Establishment.findById(idEstablishment);
    if (infoEstablishment.owners.includes(IDuser)) {
      next();
    } else {
      return res.json('Unauthorized');
    }
  } catch (error) {
    console.log(error);
  }
};

const checkIfUserCanBooking = async (req, res, next) => {
  const idUser = req.session.currentUser._id;
  const { idEstablishment } = req.params;
  try {
    const searchUser = await Establishment.findOne(
      { _id: idEstablishment }, { $or: [{ clients: idUser }, { owners: idUser }] },
    );
    if (searchUser) {
      next();
    } else {
      return res.json('401: Unauthorized');
    }
  } catch (error) {
    console.log(error);
  }
};

const checkIfNameOfEstablishmentExists = async (req, res, next) => {
  const { _id: companyID } = res.locals.dataCompany;
  const { name } = req.body;
  let exist = false;
  try {
    const getCompany = await Company.findById(companyID).populate('establishments');
    const { establishments } = getCompany;
    establishments.forEach((establishment) => {
      if (establishment.name === name) {
        exist = true;
      }
    });
    if (!exist) {
      next();
    } else {
      return res.json('This name of establishment is already created');
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  checkIfNameOfEstablishmentExists,
  checkIfIsPossibleBook,
  checkIfPercentIsAllowedByLaw,
  checkIfUserCanBooking,
  checkIfHourIsAllowed,
  checkIfUserIsOwnerOfCompanyForCreateEstablishments,
  checkIfTimeChosedByTheUserIsAllowed,
  checkIfUserIsOwnerEstablishment,
};
