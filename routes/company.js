/* eslint-disable no-underscore-dangle */
const express = require('express');
const { checkIfLoggedIn } = require('../middlewares');

const User = require('../models/User');
const Company = require('../models/Company');

const router = express.Router();

router.use(checkIfLoggedIn);  //obliga a estar logueado
//luego tendremos que indicar que solo lo puedan hacerlo los usuarios admins.

//create a new company
router.post('/create', async (req, res, next) => {
  const IDowner = req.session.currentUser._id;
  const { name, description } = req.body;
  try {
    const owner = await User.findById(IDowner);
    const newCompany = await Company.create({
      name, description, owners: owner,
    });
    return res.json(newCompany);
  } catch (error) {
    console.log(error);
  }
});


//show the info of a company
router.get('/:_id', async(req, res, next) =>{
  const idcompany = req.params;
  try {
    const showCompany = await Company.findById(idcompany);
    return res.json(showCompany);
  } catch (error) {
    console.log(error);
  }
})

//delete company
router.delete('/:_id', async(req, res, next) =>{
  const idcompany = req.params;
  try {
    const showCompany = await Company.findByIdAndDelete(idcompany);
    return res.json(showCompany);
  } catch (error) {
    console.log(error);
  }
})

module.exports = router;


  // res.status(200).json({
  // 	demo: 'Welcome this route is protected',
  // });