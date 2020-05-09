const Establishment = require('../models/Establishment');

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

//cuando tenga el front y me pasen las horas ya haremos:
const checkIfHourIsAllowed = async (req, res, next) => {
  const { startTime, endingTime } = req.body;
  const { idEstablishment } = req.params;
  try {
    const establishment = await Establishment.findById(idEstablishment);
    if (establishment) {
      console.log('OBJETO', establishment);
      if (startTime < establishment.timetable.startHourShift || endingTime > establishment.timetable.finalHourShift) {
        //res.locals.hours = req.body;
        next();
      } else {
        res.status(422).json({ code: 'Hour selected not allowed' });
      }
    }
  } catch (error) {
    res.status(422).json({ code: 'Object fail' });
  }
};

module.exports = {
  checkIfLoggedIn,
  checkIfHourIsAllowed,
  checkUsernameAndPasswordNotEmpty,
};
