/* eslint-disable no-underscore-dangle */
//const Establishment = require('../models/Establishment');
const Company = require('../models/Company');

// Como aprovechar esto para establishment y no tener que hacer 2 diferentes?
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

module.exports = {
  checkIfUserIsOwner,
};
