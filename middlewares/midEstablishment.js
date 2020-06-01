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
// crear tantas franjas de tiempo como tiempo máximo esté permitido.
const checkIfIsPossibleBook = async (req, res, next) => {
  const { idEstablishment } = req.params;
  let { day, startHour, duration } = req.body;
  duration = parseInt(duration) //pasamos la duration a number
  console.log("Los datos que recibo en el body son", req.body)
  const dateParsed = new Date(day); //parseamos la fecha pàra que tenga el mismo modelo que el de la bbdd

  const establishment = await Establishment.findById(idEstablishment);
  console.log("Los datos que tiene el establishment son", establishment.timetable)
  const { maximumCapacity, percentOfPeopleAllowed } = establishment.capacity;
  let { timeAllowedPerBooking, startHourShift, finalHourShift } = establishment.timetable;
  timeAllowedPerBooking = parseInt(timeAllowedPerBooking) //pasamos la timeAllowed a number
  console.log("time allowed",timeAllowedPerBooking)
  const percentOfUsersAllowedInTheEstablishmentInCertainTime = Math.round(  //sacamos el numero total de usuarios que se van a permitir por sesión.
    (maximumCapacity * percentOfPeopleAllowed) / 100,
  );

    //saber los inicios de cada sesion de tiempo. para ello tenemos que encontrar los multiplos de horas hasta que cierra el local.
    console.log("la jornada empieza alas",startHourShift);
    startHourShift = parseInt(startHourShift)//los pasamos a minutos
    finalHourShift = parseInt(finalHourShift)//los pasamos a minutos

    //sabemos cuantas sesiones van a estar permitidas durante la jornada especificada en ese estableciemiento.(puede ser que no nos haga falta.)
    const horasAbierto = finalHourShift-startHourShift
    console.log("horas abierto", horasAbierto)
    const sesionesTotales = (horasAbierto*60)/timeAllowedPerBooking;
    console.log("sesiones totales", sesionesTotales)

    // temp = startHourShift.split(':');
    // console.log("me quedo con los minutos de la startHourShift del establishment", temp[1]);
    // minutesOfEstablishment = parseInt(temp[1])//los pasamos a minutos
    // const listOfIniciosDeSesionDeTiemposDisponibles = [];
    // for (let index = 0; index < sesionesTotales; index++) {
    //   minutesOfEstablishment = minutesOfEstablishment + timeAllowedPerBooking;
    //   listOfIniciosDeSesionDeTiemposDisponibles.push(minutesOfEstablishment)
    // }
    console.log("lista que me devuelve",listOfIniciosDeSesionDeTiemposDisponibles)
    // let cont = startHourShift;
    // while (cont < finalHourShift) {
    //   cont = cont + timeAllowedPerBooking;  //aqui hay que pensar en el tiempo. si es mas de 59 pasa de hora.
    //   listOfIniciosDeSesionDeTiemposDisponibles.push(cont)
    //   console.log("lista de inicios de sesion", listOfIniciosDeSesionDeTiemposDisponibles)
    // }

  console.log("el numero total de personas permitidas en un determinado espacio de tiempo en este establecimiento son:",percentOfUsersAllowedInTheEstablishmentInCertainTime);
  const findBookingsByDay = await Booking.find({ day: dateParsed, idEstablishment})//encontramos los que coinciden.
  console.log("bookings que coinciden en dia", findBookingsByDay)
  let countBookings = 0;
  findBookingsByDay.map((booking)=>{ //con esto recorremos todas las bookings de ese dia buscando que hayan empezado en la misma sesion
    // punto = booking.startHour.split(':');
    // console.log("me quedo con los minutos de la startHur introducido por el usuario:", punto[1]);
    // minutesOfBooking = parseInt(punto[1])//los pasamos a minutos
    // console.log("minutos en numero(alomejor esto no hace falta)",minutesOfBooking)
    // //creo que puede ser una idea luego desde el front obligar al usuario que ponga la duration maxima permitida apartir de la hora que reserva.
    // suma = minutesOfBooking + duration
    // console.log("la suma de los minutos entre que entra y la duracion es", suma)
    // resta = suma - timeAllowedPerBooking;
    // console.log("el resultado de la resta entre los minutos que ha puesto y los permitidos son", resta)

    //falta comprobar si el resultado de esta ultima operacion se considera un tiempo de inicio de sesion: 9.00, 9.20, 9.40
    //en ese caso cuenta que está bien y el contador suma
    if(booking.startHour === '09:00'){
      countBookings= countBookings +1;
    }
    // timeAllowedPerBooking
    //apartir de la startHour empieza a mirar por cada timeAllowed per booking cuantas reservas
  })
  console.log("numero total de usuarios en la primera sesion del dia", countBookings)
  if(countBookings<percentOfUsersAllowedInTheEstablishmentInCertainTime){
    next()
  } else {
    res.status(422).json({ code: 'The capacity is superada' });
  }
};

// cuando tenga el front y me pasen las horas ya haremos:
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
        // res.locals.hours = req.body;
        next();
      }
    }
  } catch (error) {
    res.status(422).json({ code: 'Object fail' });
  }
};

// cuando tenga el front y me pasen las horas ya haremos:
const checkIfDurationChosedByTheUserIsAllowed = async (req, res, next) => {
  const { duration } = req.body;
  const { idEstablishment } = req.params;
  try {
    const establishment = await Establishment.findById(idEstablishment);
    if (duration <= establishment.timetable.timeAllowedPerBooking) {
      // res.locals.hours = req.body;
      next();
    } else {
      res.status(422).json({ code: 'The duration of the booking exceed the limit' });
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
      console.log("pasamos el primer midd")
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

//no funciona!
const checkIfNameOfEstablishmentExists = async (req, res, next) => {
  const { _id: companyID } = res.locals.dataCompany;
  // console.log(companyID);
  const { name } = req.body;
  const exist = false;
  try {
    const getCompany = await Company.findById(companyID);
    const { establishments } = getCompany;

    const getEstablishments = await Company.findById(companyID).populate('establishments');
    // console.log(getEstablishments);

    // if (serachNameOfEstablishment.name === name) {
    //   console.log("Ese nombre ya está cogido");
    //   exist = true;
    // }

    if (!exist) {
      next();
    } else {
      return res.json('This name of establishment is already created');
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
  checkIfNameOfEstablishmentExists,
  checkIfIsPossibleBook,
  checkIfPercentIsAllowedByLaw,
  checkIfUserCanBooking,
  checkIfHourIsAllowed,
  checkIfUserIsOwnerOfCompanyForCreateEstablishments,
  checkIfDurationChosedByTheUserIsAllowed,
  checkIfUserIsOwnerEstablishment,
  orderByDate,
  orderByDateReverse
};
