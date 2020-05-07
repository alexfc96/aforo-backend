/* eslint-disable no-underscore-dangle */
const express = require('express');
const { checkIfLoggedIn } = require('../middlewares');

const router = express.Router();

router.use(checkIfLoggedIn);

router.get('/', (req, res, next) => {
	res.status(200).json({
		demo: 'Welcome this route is protected',
	});
});

module.exports = router;
