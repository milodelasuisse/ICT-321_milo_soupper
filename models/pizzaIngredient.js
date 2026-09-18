
const db = require('../config/database');

class PizzaIngredient {
    static findIngredientsByPizzaId(pizzaId) {
        const sql = `
            SELECT i.*
            FROM ingredients i
                     JOIN pizza_ingredients pi ON pi.ingredient_id = i.id
            WHERE pi.pizza_id = ?
            ORDER BY i.id
        `;
        return new Promise((resolve, reject) => {
            db.all(sql, [pizzaId], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    static add(pizzaId, ingredientId) {
        const sql = `INSERT OR IGNORE INTO pizza_ingredients (pizza_id, ingredient_id) VALUES (?, ?)`;
        return new Promise((resolve, reject) => {
            db.run(sql, [pizzaId, ingredientId], function (err) {
                if (err) return reject(err);
                resolve(this.changes);
            });
        });
    }

    static remove(pizzaId, ingredientId) {
        const sql = `DELETE FROM pizza_ingredients WHERE pizza_id = ? AND ingredient_id = ?`;
        return new Promise((resolve, reject) => {
            db.run(sql, [pizzaId, ingredientId], function (err) {
                if (err) return reject(err);
                resolve(this.changes);
            });
        });
    }

    // Replaces the full set of ingredients linked to a pizza
    static setForPizza(pizzaId, ingredientIds = []) {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');
                db.run('DELETE FROM pizza_ingredients WHERE pizza_id = ?', [pizzaId], (err) => {
                    if (err) {
                        db.run('ROLLBACK');
                        return reject(err);
                    }

                    const uniqueIds = [...new Set(ingredientIds)];
                    if (uniqueIds.length === 0) {
                        db.run('COMMIT', (commitErr) => {
                            if (commitErr) return reject(commitErr);
                            resolve();
                        });
                        return;
                    }

                    const stmt = db.prepare('INSERT INTO pizza_ingredients (pizza_id, ingredient_id) VALUES (?, ?)');
                    let hasError = false;
                    uniqueIds.forEach((ingredientId) => {
                        stmt.run(pizzaId, ingredientId, (err) => {
                            if (err) hasError = err;
                        });
                    });
                    stmt.finalize((err) => {
                        if (err || hasError) {
                            db.run('ROLLBACK');
                            return reject(err || hasError);
                        }
                        db.run('COMMIT', (commitErr) => {
                            if (commitErr) return reject(commitErr);
                            resolve();
                        });
                    });
                });
            });
        });
    }
}

module.exports = PizzaIngredient;
