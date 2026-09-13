// routes/router.js
const express = require('express');
const pizzasRouter = require('./pizza');
const ingredientRouter = require('./ingredient');

const router = express.Router();

router.use('/pizzas', pizzasRouter);
router.use('/ingredients', ingredientRouter);

module.exports = router;
