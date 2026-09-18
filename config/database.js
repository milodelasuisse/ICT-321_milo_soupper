// config/database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbFile = process.env.DB_FILE || path.join(__dirname, '..', 'dev.sqlite');

const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error('Could not connect to sqlite', err);
        process.exit(1);
    }
    console.log('Connected to sqlite database:', dbFile);
});

// Initialize pizzas table if not exists
const initSql = `
CREATE TABLE IF NOT EXISTS pizzas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  imageUrl TEXT,
  price REAL NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
    );
CREATE TABLE IF NOT EXISTS pizza_ingredients (
    pizza_id INTEGER NOT NULL,
    ingredient_id INTEGER NOT NULL,
    PRIMARY KEY (pizza_id, ingredient_id),
    FOREIGN KEY (pizza_id) REFERENCES pizzas(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
    );
`;

db.serialize(() => {
    // sqlite disables FK enforcement by default per connection
    db.run('PRAGMA foreign_keys = ON');
    db.exec(initSql, (err) => {
        if (err) {
            console.error('Failed to initialize database', err);
            process.exit(1);
        }

        // Migration: drop the legacy free-text "ingredients" column now that
        // the pizza <-> ingredient relation is handled by pizza_ingredients.
        db.all('PRAGMA table_info(pizzas)', [], (err, columns) => {
            if (err) {
                console.error('Failed to inspect pizzas table', err);
                return;
            }
            const hasLegacyColumn = columns.some((c) => c.name === 'ingredients');
            if (!hasLegacyColumn) return;

            db.run('ALTER TABLE pizzas DROP COLUMN ingredients', (err) => {
                if (err) {
                    console.error('Failed to drop legacy ingredients column', err);
                    return;
                }
                console.log('Dropped legacy pizzas.ingredients column');
            });
        });
    });
});

module.exports = db;