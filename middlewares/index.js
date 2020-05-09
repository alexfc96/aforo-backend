const Establishment = require('../models/Establishment');
const Company = require('../models/Company');

const checkIfLoggedIn = (req, res, next) => {
  if (req.session.currentUser) {
    next();
  } else {
    res.status(401).json({ code: 'unauthorized' });
  }
};

const checkUsernameAndPasswordNotEmpty = (req, res, next) => {
  const { username, password } = req.body;

  if (username !== '' && password !== '') {
    res.locals.auth = req.body;
    next();
  } else {
    res.status(422).json({ code: 'validation' });
  }
};

// cuando tenga el front y me pasen las horas ya haremos:
const checkIfHourIsAllowed = async (req, res, next) => {
  const { startTime, endingTime } = req.body;
  const { idEstablishment } = req.params;
  try {
    const establishment = await Establishment.findById(idEstablishment);
    if (establishment) {
      //console.log('OBJETO', establishment);
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

//Como aprovechar esto para establishment y no tener que hacer 2 diferentes?
//control for allow delete companay only for the owners
const checkIfUserIsOwner = async (req, res, next) => {
  const IDuser = req.session.currentUser._id;
  const { idCompany } = req.params;
  try {
    const infoCompany = await Company.findById(idCompany);
    if (infoCompany.owners.includes(IDuser)) {
      next();
    }
    return res.json('Unauthorized');
  } catch (error) {
    console.log(error);
  }
};

//control for allow delete establishments only for the owners
const checkIfUserIsOwnerEstablishment = async (req, res, next) => {
  const IDuser = req.session.currentUser._id;
  const { idEstablishment } = req.params;
  try {
    const infoEstablishment = await Establishment.findById(idEstablishment);
    if (infoEstablishment.owners.includes(IDuser)) {
      next();
    }
    return res.json('Unauthorized');
  } catch (error) {
    console.log(error);
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

module.exports = {
  checkIfLoggedIn,
  checkIfHourIsAllowed,
  checkIfTimeChosedByTheUserIsAllowed,
  checkUsernameAndPasswordNotEmpty,
  checkIfUserIsOwner,
  checkIfUserIsOwnerEstablishment,
};
