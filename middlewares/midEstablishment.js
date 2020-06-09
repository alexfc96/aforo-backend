/* eslint-disable no-underscore-dangle */
const Establishment = require('../models/Establishment');
const Company = require('../models/Company');
const Booking = require('../models/Booking');
require('dotenv').config();

// check if the percentage of allowed people is less than the one indicated in the .env when an owner of an establishment sets this field 
const checkIfPercentIsAllowedByLaw = async (req, res, next) => {
  const maximumPercentOfPeopleAllowedByLaw = process.env.MAX_PERCENT;
  const { capacity } = req.body;
  if (capacity.percentOfPeopleAllowed > maximumPercentOfPeopleAllowedByLaw) {
    res.status(422).json({ code: 'The specified percentage exceeds that stipulated by law.' });
  } else {
    next();
  }
};

// check if there is space in the time span the user is trying to book
const checkIfIsPossibleBook = async (req, res, next) => {
  const IDuser = req.session.currentUser._id;
  const { idEstablishment } = req.params;

  //check if the user is owner of the establishemnt because they can book without restrictions
  const establishment = await Establishment.findById(idEstablishment);
  if (establishment.owners.includes(IDuser)) {
    next();
  } else {
    let { day } = req.body;
    const dateParsed = new Date(day); //parse date with the same format than the db
    let { howOftenCanBookPerDay } = establishment.timetable;
  
    const bookingInThisDay = await Booking.find({ day: dateParsed, idUser: IDuser, idEstablishment })
  
    if(bookingInThisDay.length<howOftenCanBookPerDay){
      next()
    } else {
      res.status(422).json({ code: 'You have exceeded the maximum number of reservations in one day.' });
    }
  }
};

// check if possible the hour selected:
const checkIfHourIsAllowed = async (req, res, next) => {
  const { startHour } = req.body;
  const { idEstablishment } = req.params;
  try {
    const establishment = await Establishment.findById(idEstablishment);
    if (establishment) {
      if (startHour < establishment.timetable.startHourShift
        || startHour > establishment.timetable.finalHourShift) {
        res.status(422).json({ code: 'Hour selected not allowed' });

      } else {
        next();
      }
    }
  } catch (error) {
    res.status(422).json({ code: 'Object fail' });
  }
};

// control for allow delete companay only for the owners
const checkIfUserIsOwnerOfCompanyForCreateEstablishments = async (req, res, next) => {
  const IDuser = req.session.currentUser._id;
  const { company } = req.body;
  try {
    // we look for the company that the admin has selected to link the establishment
    const findCompanyByName = await Company.findOne(
      { name: company },
    );
    const infoOfCompany = await Company.findById(findCompanyByName._id);
    if (infoOfCompany.owners.includes(IDuser)) {
      res.locals.dataCompany = infoOfCompany;
      next();
    } else {
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

//func (create establishment)
async function createEstablishment(body, dataCompany, clients) {
  const {
    name, capacity, description, address, timetable,
  } = body;
  const { _id: companyID, owners } = dataCompany;
  const newEstablishment = await Establishment.create({
    name, capacity, description, address, timetable, owners, clients, company: companyID,
    // link to the company because is possible that the owner could have more than once company
  });
  return newEstablishment;
}

async function orderByDate(array) {
  array.sort((a, b) => {
    a = new Date(a.day);
    b = new Date(b.day);
    return a > b ? 1 : a < b ? -1 : 0;
  });
}

async function orderByDateReverse(array) {
  array.sort((a, b) => {
    a = new Date(a.day);
    b = new Date(b.day);
    return a < b ? 1 : a > b ? -1 : 0;
  });
}


module.exports = {
  createEstablishment,
  checkIfIsPossibleBook,
  checkIfPercentIsAllowedByLaw,
  checkIfUserCanBooking,
  checkIfHourIsAllowed,
  checkIfUserIsOwnerOfCompanyForCreateEstablishments,
  checkIfUserIsOwnerEstablishment,
  orderByDate,
  orderByDateReverse
};
