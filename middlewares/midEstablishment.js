/* eslint-disable no-underscore-dangle */
const Establishment = require('../models/Establishment');
const Company = require('../models/Company');

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
    } else {//si no pongo el else se muestra siempre el unauthorized. Porque? el next no es como un return?
      return res.json('Unauthorized');
    }
  } catch (error) {
    console.log(error);
  }
};

// control for allow delete establishments only for the owners
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

module.exports = {
  checkIfHourIsAllowed,
  checkIfUserIsOwnerOfCompanyForCreateEstablishments,
  checkIfTimeChosedByTheUserIsAllowed,
  checkIfUserIsOwnerEstablishment,
};
