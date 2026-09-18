
const { validationResult } = require('express-validator');
const Pizza = require('../models/pizza');
const PizzaIngredient = require('../models/pizzaIngredient');
const Ingredient = require('../models/ingredient');

/**
 * Controller functions use Express (req, res) signatures and
 * respond with status codes matching MDN/HTTP recommendations.
 */

exports.create = async (req, res, next) => {
    try {
        // validation result
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // 400 Bad Request for validation problems
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, imageUrl, price, ingredientIds } = req.body;
        const created = await Pizza.create({ name, imageUrl, price, ingredientIds });
        // 201 Created
        return res.status(201).json(created);
    } catch (err) {
        next(err);
    }
};

exports.findAll = async (req, res, next) => {
    try {
        const pizzas = await Pizza.findAll();
        // 200 OK
        return res.status(200).json(pizzas);
    } catch (err) {
        next(err);
    }
};

exports.findOne = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid pizza id' });

        const pizza = await Pizza.findById(id);
        if (!pizza) return res.status(404).json({ error: 'Pizza not found' }); // 404 Not Found

        return res.status(200).json(pizza);
    } catch (err) {
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        // validation result
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid pizza id' });

        const { name, imageUrl, price, ingredientIds } = req.body;
        const updated = await Pizza.update(id, { name, imageUrl, price, ingredientIds });
        if (!updated) return res.status(404).json({ error: 'Pizza not found' }); // 404 Not Found

        return res.status(200).json(updated);
    } catch (err) {
        next(err);
    }
};

exports.delete = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid pizza id' });

        const deleted = await Pizza.delete(id);
        if (deleted === 0) return res.status(404).json({ error: 'Pizza not found' });

        // 204 No Content on successful delete
        return res.status(204).send();
    } catch (err) {
        next(err);
    }
};

exports.listIngredients = async (req, res, next) => {
    try {
        const pizzaId = Number(req.params.id);
        if (Number.isNaN(pizzaId)) return res.status(400).json({ error: 'Invalid pizza id' });

        const pizza = await Pizza.findById(pizzaId);
        if (!pizza) return res.status(404).json({ error: 'Pizza not found' });

        return res.status(200).json(pizza.ingredientsList);
    } catch (err) {
        next(err);
    }
};

exports.addIngredient = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const pizzaId = Number(req.params.id);
        const { ingredientId } = req.body;
        if (Number.isNaN(pizzaId)) return res.status(400).json({ error: 'Invalid pizza id' });

        const pizza = await Pizza.findById(pizzaId);
        if (!pizza) return res.status(404).json({ error: 'Pizza not found' });

        const ingredient = await Ingredient.findById(ingredientId);
        if (!ingredient) return res.status(404).json({ error: 'Ingredient not found' });

        await PizzaIngredient.add(pizzaId, ingredientId);
        const updated = await Pizza.findById(pizzaId);
        return res.status(201).json(updated.ingredientsList);
    } catch (err) {
        next(err);
    }
};

exports.removeIngredient = async (req, res, next) => {
    try {
        const pizzaId = Number(req.params.id);
        const ingredientId = Number(req.params.ingredientId);
        if (Number.isNaN(pizzaId) || Number.isNaN(ingredientId)) {
            return res.status(400).json({ error: 'Invalid pizza or ingredient id' });
        }

        const pizza = await Pizza.findById(pizzaId);
        if (!pizza) return res.status(404).json({ error: 'Pizza not found' });

        const deleted = await PizzaIngredient.remove(pizzaId, ingredientId);
        if (deleted === 0) return res.status(404).json({ error: 'Ingredient not linked to this pizza' });

        // 204 No Content on successful delete
        return res.status(204).send();
    } catch (err) {
        next(err);
    }
};
