/* eslint-disable no-underscore-dangle */
const Establishment = require('../models/Establishment');
const Company = require('../models/Company');

// control for allow delete companay only for the owners
const checkIfUserIsOwner = async (req, res, next) => {
  const IDuser = req.session.currentUser._id;
  const { idCompany } = req.params;
  try {
    const infoCompany = await Company.findById(idCompany);
    if (infoCompany.owners.includes(IDuser)) {
      next();
    } else {
      return res.json('Unauthorized'); //configurar numero de error correspondiente.
    }
  } catch (error) {
    console.log(error);
  }
};

// check if the user session is owner of the company(used in the routes of the establishments)
const checkIfUserIsOwnerOfCompany = async (req, res, next) => {
  const IDuser = req.session.currentUser._id;
  const { idEstablishment } = req.params;
  try {
    const infoEstablishment = await Establishment.findById(idEstablishment);
    const infoCompany = await Company.findById(infoEstablishment.company);
    if (infoCompany.owners.includes(IDuser)) {
      next();
    } else {
      return res.json('Unauthorized');
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  checkIfUserIsOwner,
  checkIfUserIsOwnerOfCompany,
};
