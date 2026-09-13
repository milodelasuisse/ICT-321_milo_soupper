
const { validationResult } = require('express-validator');
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

        const { name, price } = req.body;
        const created = await Ingredient.create({ name, price });
        // 201 Created
        return res.status(201).json(created);
    } catch (err) {
        next(err);
    }
};

exports.findAll = async (req, res, next) => {
    try {
        const ingredients = await Ingredient.findAll();
        // 200 OK
        return res.status(200).json(ingredients);
    } catch (err) {
        next(err);
    }
};

exports.findOne = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid ingredient id' });

        const ingredient = await Ingredient.findById(id);
        if (!ingredient) return res.status(404).json({ error: 'ingredient not found' }); // 404 Not Found

        return res.status(200).json(ingredient);
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
        if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid ingredient id' });

        const { name, price } = req.body;
        const updated = await Ingredient.update(id, { name, price });
        if (!updated) return res.status(404).json({ error: 'ingredient not found' }); // 404 Not Found

        return res.status(200).json(updated);
    } catch (err) {
        next(err);
    }
};

exports.delete = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid ingredient id' });

        const deleted = await Ingredient.delete(id);
        if (deleted === 0) return res.status(404).json({ error: 'ingredient not found' });

        // 204 No Content on successful delete
        return res.status(204).send();
    } catch (err) {
        next(err);
    }
};
