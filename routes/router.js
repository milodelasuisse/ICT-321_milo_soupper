// routes/router.js
const express = require('express');
const pizzasRouter = require('./pizza');

const router = express.Router();

router.use('/pizzas', pizzasRouter);

module.exports = router;
