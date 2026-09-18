// routes/pizza.js
const express = require('express');
const { body, param } = require('express-validator');
const pizzaController = require('../controllers/pizzaController');

const router = express.Router();

/**
 * @openapi
 * /api/v1/pizzas:
 *   get:
 *     summary: Retrieve a list of pizzas
 *     responses:
 *       200:
 *         description: A list of pizzas
 *   post:
 *     summary: Create a new pizza
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               price:
 *                 type: number
 *               ingredientIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: Pizza created
 *       400:
 *         description: Invalid input
 */

/**
 * @openapi
 * /api/v1/pizzas/{id}:
 *   get:
 *     summary: Get a pizza by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A single pizza
 *       404:
 *         description: Pizza not found
 *   put:
 *     summary: Update a pizza by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               price:
 *                 type: number
 *               ingredientIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Pizza updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Pizza not found
 *   delete:
 *     summary: Delete a pizza by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Pizza deleted
 *       404:
 *         description: Pizza not found
 */

/**
 * Validation rules
 */
const createAndUpdateValidations = [
    body('name').isString().notEmpty().withMessage('name is required'),
    body('imageUrl').optional().isString().isURL().withMessage('imageUrl must be a valid URL'),
    body('price').isFloat({ gt: 0 }).withMessage('price must be a positive number'),
    body('ingredientIds').optional().isArray().withMessage('ingredientIds must be an array of integers'),
    body('ingredientIds.*').optional().isInt().withMessage('ingredientIds must contain integers'),
];

router.get('/', pizzaController.findAll);
router.post('/', createAndUpdateValidations, pizzaController.create);
router.get('/:id', [param('id').isInt().withMessage('id must be an integer')], pizzaController.findOne);
router.put('/:id', [param('id').isInt().withMessage('id must be an integer'), ...createAndUpdateValidations], pizzaController.update);
router.delete('/:id', [param('id').isInt().withMessage('id must be an integer')], pizzaController.delete);

/**
 * @openapi
 * /api/v1/pizzas/{id}/ingredients:
 *   get:
 *     summary: List ingredients linked to a pizza
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of ingredients for this pizza
 *       404:
 *         description: Pizza not found
 *   post:
 *     summary: Link an existing ingredient to a pizza
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ingredientId
 *             properties:
 *               ingredientId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Ingredient linked
 *       404:
 *         description: Pizza or ingredient not found
 */
router.get(
    '/:id/ingredients',
    [param('id').isInt().withMessage('id must be an integer')],
    pizzaController.listIngredients
);
router.post(
    '/:id/ingredients',
    [
        param('id').isInt().withMessage('id must be an integer'),
        body('ingredientId').isInt().withMessage('ingredientId must be an integer'),
    ],
    pizzaController.addIngredient
);

/**
 * @openapi
 * /api/v1/pizzas/{id}/ingredients/{ingredientId}:
 *   delete:
 *     summary: Unlink an ingredient from a pizza
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: ingredientId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Ingredient unlinked
 *       404:
 *         description: Pizza not found or ingredient not linked
 */
router.delete(
    '/:id/ingredients/:ingredientId',
    [
        param('id').isInt().withMessage('id must be an integer'),
        param('ingredientId').isInt().withMessage('ingredientId must be an integer'),
    ],
    pizzaController.removeIngredient
);

module.exports = router;
