/* ==========================================================================
   SHREEJI SAFFRON — DATABASE MANAGEMENT & PERSISTENCE LAYER
   Powered by Node.js Native SQLite (ACID Compliant, WAL Mode)
   ========================================================================== */

const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Database file path (configurable via DATABASE_PATH env var)
const dbPath = process.env.DATABASE_PATH || path.join(dataDir, 'saffron.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode & Foreign Keys for high concurrency and relational integrity
db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;
`);

/**
 * Initialize all database schemas, constraints, and indexes
 */
function initSchema() {
    db.exec(`
        -- 1. PRODUCTS TABLE
        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            slug TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            subtitle TEXT NOT NULL,
            grade TEXT NOT NULL,
            origin TEXT NOT NULL,
            description TEXT NOT NULL,
            price_1g INTEGER NOT NULL,
            price_2g INTEGER NOT NULL,
            price_5g INTEGER NOT NULL,
            mrp_1g INTEGER NOT NULL,
            mrp_2g INTEGER NOT NULL,
            mrp_5g INTEGER NOT NULL,
            stock_grams REAL NOT NULL DEFAULT 500.0,
            crocin_val REAL NOT NULL,
            safranal_val REAL NOT NULL,
            picro_val REAL NOT NULL,
            rating REAL NOT NULL DEFAULT 5.0,
            review_count INTEGER NOT NULL DEFAULT 0,
            badge TEXT,
            image_url TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- 2. INQUIRIES TABLE (Contact Form)
        CREATE TABLE IF NOT EXISTS inquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            inquiry_ref TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            subject TEXT NOT NULL,
            message TEXT NOT NULL,
            ip_address TEXT,
            status TEXT NOT NULL DEFAULT 'NEW',
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- 3. SUBSCRIBERS TABLE (Newsletter / Private Guild)
        CREATE TABLE IF NOT EXISTS subscribers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            status TEXT NOT NULL DEFAULT 'ACTIVE',
            source TEXT DEFAULT 'WEB_NEWSLETTER',
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- 4. ORDERS TABLE (Cart Allocations & Checkout)
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_ref TEXT UNIQUE NOT NULL,
            customer_name TEXT NOT NULL,
            customer_email TEXT NOT NULL,
            customer_phone TEXT NOT NULL,
            shipping_address TEXT NOT NULL,
            city TEXT NOT NULL,
            postal_code TEXT NOT NULL,
            country TEXT NOT NULL DEFAULT 'India',
            subtotal INTEGER NOT NULL,
            shipping_fee INTEGER NOT NULL DEFAULT 0,
            total_amount INTEGER NOT NULL,
            payment_status TEXT NOT NULL DEFAULT 'PENDING',
            order_status TEXT NOT NULL DEFAULT 'CONFIRMED',
            notes TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- 5. ORDER_ITEMS TABLE
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
            product_id TEXT NOT NULL,
            product_name TEXT NOT NULL,
            weight_grams INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            unit_price INTEGER NOT NULL,
            line_total INTEGER NOT NULL
        );

        -- INDEXES FOR PERFORMANCE
        CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
        CREATE INDEX IF NOT EXISTS idx_inquiries_ref ON inquiries(inquiry_ref);
        CREATE INDEX IF NOT EXISTS idx_inquiries_email ON inquiries(email);
        CREATE INDEX IF NOT EXISTS idx_orders_ref ON orders(order_ref);
        CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
    `);
}

/**
 * Seed initial real product data if table is empty
 */
function seedProducts() {
    const countQuery = db.prepare('SELECT COUNT(*) AS total FROM products');
    const result = countQuery.get();
    if (result && result.total > 0) return; // already seeded

    const insert = db.prepare(`
        INSERT INTO products (
            id, slug, name, subtitle, grade, origin, description,
            price_1g, price_2g, price_5g, mrp_1g, mrp_2g, mrp_5g,
            stock_grams, crocin_val, safranal_val, picro_val,
            rating, review_count, badge, image_url
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?
        )
    `);

    const initialProducts = [
        [
            'prod_mogra',
            'mogra',
            'Mogra Grade I Saffron',
            'IMPERIAL RESERVE',
            'Grade I',
            'Iran // Kashmir',
            'The pinnacle of red gold. 100% pure, trumpet-shaped stigma tips hand-snipped without yellow style threads. Supreme coloring power and rich floral-honey bouquet.',
            599, 1099, 2499, 799, 1499, 3499,
            450.0, 264.8, 46.2, 89.4,
            5.0, 248, 'IMPERIAL RESERVE', 'images/product-mogra.png'
        ],
        [
            'prod_lachha',
            'lachha',
            'Lachha Grade II Saffron',
            'HERITAGE CUT',
            'Grade II',
            'Full Strand // Kashmir',
            'Traditional whole-flower saffron retaining both the deep crimson stigma and the natural golden-yellow style tail. Excellent natural preservation of delicate ethereal oils.',
            449, 849, 1999, 599, 1099, 2699,
            380.0, 224.5, 41.0, 82.1,
            4.9, 186, 'HERITAGE CUT', 'images/product-lachha.png'
        ],
        [
            'prod_zarda',
            'zarda',
            'Zarda Fine Saffron',
            'CULINARY ESSENCE',
            'Grade III',
            'Micro-Ground // Kashmir',
            'Cryo-milled saffron powder crafted for rapid dispersion. Ideal for artisanal patisserie, daily ayurvedic milk preparations, and gourmet masterchef infusions.',
            299, 549, 1299, 449, 799, 1899,
            620.0, 188.2, 36.5, 74.0,
            4.8, 312, 'CULINARY ESSENCE', 'images/product-zarda.png'
        ]
    ];

    for (const p of initialProducts) {
        insert.run(...p);
    }
}

// Auto-run schema initialization
initSchema();
seedProducts();

module.exports = {
    db,
    initSchema,
    seedProducts
};
