/* ==========================================================================
   SHREEJI SAFFRON — DATABASE TEST SUITE
   ========================================================================== */

const test = require('node:test');
const assert = require('node:assert');
const { DatabaseSync } = require('node:sqlite');

test('Database: in-memory schema initialization and constraints', (t) => {
    const memDb = new DatabaseSync(':memory:');
    memDb.exec('PRAGMA foreign_keys = ON;');

    // Create tables
    memDb.exec(`
        CREATE TABLE products (
            id TEXT PRIMARY KEY,
            slug TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            price_1g INTEGER NOT NULL,
            stock_grams REAL NOT NULL DEFAULT 100.0
        );

        CREATE TABLE orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_ref TEXT UNIQUE NOT NULL,
            total_amount INTEGER NOT NULL
        );

        CREATE TABLE order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
            product_id TEXT NOT NULL REFERENCES products(id),
            quantity INTEGER NOT NULL
        );
    `);

    // Insert Product
    const insertProd = memDb.prepare('INSERT INTO products (id, slug, name, price_1g) VALUES (?, ?, ?, ?)');
    insertProd.run('p1', 'mogra', 'Mogra Saffron', 599);

    const prod = memDb.prepare('SELECT * FROM products WHERE slug = ?').get('mogra');
    assert.strictEqual(prod.name, 'Mogra Saffron');
    assert.strictEqual(prod.price_1g, 599);

    // Test Transaction: Order creation and stock decrement
    memDb.exec('BEGIN TRANSACTION;');
    const insertOrder = memDb.prepare('INSERT INTO orders (order_ref, total_amount) VALUES (?, ?)');
    const orderRes = insertOrder.run('TEST-001', 599);
    const orderId = orderRes.lastInsertRowid;

    const insertItem = memDb.prepare('INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)');
    insertItem.run(orderId, 'p1', 1);

    const updateStock = memDb.prepare('UPDATE products SET stock_grams = stock_grams - 1 WHERE id = ?');
    updateStock.run('p1');
    memDb.exec('COMMIT;');

    // Verify
    const updatedProd = memDb.prepare('SELECT stock_grams FROM products WHERE id = ?').get('p1');
    assert.strictEqual(updatedProd.stock_grams, 99.0);

    const orderItem = memDb.prepare('SELECT * FROM order_items WHERE order_id = ?').get(orderId);
    assert.strictEqual(orderItem.product_id, 'p1');

    // Test Foreign Key Cascade Delete
    memDb.prepare('DELETE FROM orders WHERE id = ?').run(orderId);
    const remainingItems = memDb.prepare('SELECT COUNT(*) AS count FROM order_items').get();
    assert.strictEqual(remainingItems.count, 0);
});
