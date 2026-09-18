
const db = require('../config/database');
const PizzaIngredient = require('./pizzaIngredient');

class Pizza {
    static async create({ name, imageUrl, price, ingredientIds }) {
        const sql = `INSERT INTO pizzas (name, imageUrl, price, created_at, updated_at)
                 VALUES (?, ?, ?, datetime('now'), datetime('now'))`;
        const params = [name, imageUrl || null, price];

        const id = await new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) return reject(err);
                resolve(this.lastID);
            });
        });

        if (Array.isArray(ingredientIds) && ingredientIds.length > 0) {
            await PizzaIngredient.setForPizza(id, ingredientIds);
        }

        return Pizza.findById(id);
    }

    static async findAll() {
        const sql = `SELECT * FROM pizzas ORDER BY id DESC`;
        const rows = await new Promise((resolve, reject) => {
            db.all(sql, [], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });

        return Promise.all(rows.map(async (row) => ({
            ...row,
            ingredientsList: await PizzaIngredient.findIngredientsByPizzaId(row.id),
        })));
    }

    static async findById(id) {
        const sql = `SELECT * FROM pizzas WHERE id = ?`;
        const row = await new Promise((resolve, reject) => {
            db.get(sql, [id], (err, row) => {
                if (err) return reject(err);
                resolve(row || null);
            });
        });
        if (!row) return null;

        row.ingredientsList = await PizzaIngredient.findIngredientsByPizzaId(id);
        return row;
    }

    static async update(id, { name, imageUrl, price, ingredientIds }) {
        const sql = `
      UPDATE pizzas
      SET name = COALESCE(?, name),
          imageUrl = COALESCE(?, imageUrl),
          price = COALESCE(?, price),
          updated_at = datetime('now')
      WHERE id = ?
    `;
        const params = [name, imageUrl, price, id];

        const changes = await new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) return reject(err);
                resolve(this.changes);
            });
        });
        if (changes === 0) return null;

        if (Array.isArray(ingredientIds)) {
            await PizzaIngredient.setForPizza(id, ingredientIds);
        }

        return Pizza.findById(id);
    }

    static delete(id) {
        const sql = `DELETE FROM pizzas WHERE id = ?`;
        return new Promise((resolve, reject) => {
            db.run(sql, [id], function (err) {
                if (err) return reject(err);
                resolve(this.changes); // number of rows deleted
            });
        });
    }
}

module.exports = Pizza;
