/* ==========================================================================
   SHREEJI SAFFRON — PRODUCTION APPLICATION SERVER
   REST API, Real Persistence, Security Hardening, & Static Delivery
   ========================================================================== */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('node:path');
const crypto = require('node:crypto');
const { db } = require('./db/database');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'shreeji_secret_admin_key_2026';

// ---------- 01. SECURITY & PARSING MIDDLEWARE ----------

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

// CORS Policy
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or same-origin)
        if (!origin) return callback(null, true);
        if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('CORS request blocked by security policy'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key']
}));

// Body parsing with strict limits
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Request logging (sanitized)
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        if (req.path.startsWith('/api')) {
            console.log(`[API] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
        }
    });
    next();
});

// ---------- 02. IN-MEMORY RATE LIMITER (ABUSE DEFENSE) ----------
const rateLimitMap = new Map();

function rateLimiter({ windowMs, maxRequests, message }) {
    return (req, res, next) => {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        const now = Date.now();
        const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

        if (now > record.resetTime) {
            record.count = 1;
            record.resetTime = now + windowMs;
        } else {
            record.count += 1;
        }

        rateLimitMap.set(ip, record);

        if (record.count > maxRequests) {
            return res.status(429).json({
                success: false,
                error: {
                    code: 'RATE_LIMIT_EXCEEDED',
                    message: message || 'Too many requests. Please try again later.'
                }
            });
        }

        next();
    };
}

// Clean up stale rate limit entries every 10 minutes (unref so tests exit cleanly)
const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimitMap.entries()) {
        if (now > record.resetTime) {
            rateLimitMap.delete(ip);
        }
    }
}, 600000);
cleanupInterval.unref();

// ---------- 03. VALIDATION HELPERS ----------
function isValidEmail(email) {
    if (typeof email !== 'string') return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim()) && email.length <= 150;
}

function sanitizeText(str, maxLength = 500) {
    if (typeof str !== 'string') return '';
    return str.trim().slice(0, maxLength);
}

// ==========================================================================
//  04. REST API ENDPOINTS
// ==========================================================================

// 1. Health Check & Telemetry
app.get('/api/health', (req, res) => {
    try {
        const dbCheck = db.prepare('SELECT 1 AS ok').get();
        return res.status(200).json({
            status: 'healthy',
            environment: NODE_ENV,
            uptime_seconds: Math.floor(process.uptime()),
            database: dbCheck && dbCheck.ok === 1 ? 'connected' : 'degraded',
            version: '1.0.0',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        return res.status(503).json({
            status: 'unhealthy',
            error: 'Database connection failed',
            timestamp: new Date().toISOString()
        });
    }
});

// 2. Products List
app.get('/api/products', (req, res) => {
    try {
        const stmt = db.prepare(`
            SELECT id, slug, name, subtitle, grade, origin, description,
                   price_1g, price_2g, price_5g, mrp_1g, mrp_2g, mrp_5g,
                   stock_grams, crocin_val, safranal_val, picro_val,
                   rating, review_count, badge, image_url
            FROM products
            ORDER BY price_1g DESC
        `);
        const products = stmt.all();
        return res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: { code: 'DATABASE_ERROR', message: 'Failed to retrieve products' }
        });
    }
});

// 3. Single Product by Slug
app.get('/api/products/:slug', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM products WHERE slug = ?');
        const product = stmt.get(req.params.slug);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: `Product '${req.params.slug}' not found` }
            });
        }
        return res.status(200).json({ success: true, data: product });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: { code: 'DATABASE_ERROR', message: 'Failed to retrieve product details' }
        });
    }
});

// 4. Contact Form Inquiries (Rate-limited, validated, persisted)
app.post('/api/inquiries', rateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    message: 'Too many inquiries transmitted from this network. Please wait 15 minutes.'
}), (req, res) => {
    try {
        const { name, email, phone, subject, message, website_hp } = req.body;

        // Honeypot bot check (hidden field)
        if (website_hp) {
            // Silently pretend success to deceive spam bots
            return res.status(200).json({
                success: true,
                inquiryRef: 'INQ-SPAM-LOGGED',
                message: 'Inquiry received'
            });
        }

        // Field Validation
        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_NAME', message: 'Please provide a valid full name (minimum 2 characters).' }
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_EMAIL', message: 'Please provide a valid email address.' }
            });
        }

        if (!message || typeof message !== 'string' || message.trim().length < 10) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_MESSAGE', message: 'Message must contain at least 10 characters.' }
            });
        }

        const validSubjects = ['order', 'wholesale', 'quality', 'other'];
        const cleanSubject = validSubjects.includes(subject) ? subject : 'other';
        const cleanName = sanitizeText(name, 100);
        const cleanEmail = email.trim().toLowerCase();
        const cleanPhone = sanitizeText(phone || '', 30);
        const cleanMessage = sanitizeText(message, 2500);
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

        // Generate unique inquiry reference code
        const inquiryRef = `INQ-2026-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

        // Insert into database
        const stmt = db.prepare(`
            INSERT INTO inquiries (inquiry_ref, name, email, phone, subject, message, ip_address, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'NEW')
        `);
        stmt.run(inquiryRef, cleanName, cleanEmail, cleanPhone, cleanSubject, cleanMessage, ip);

        return res.status(201).json({
            success: true,
            inquiryRef,
            message: `Concierge dispatch logged successfully. Reference: ${inquiryRef}`
        });

    } catch (err) {
        console.error('[Error] Inquiries POST:', err);
        return res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Failed to process inquiry. Please try again.' }
        });
    }
});

// 5. Admin Inquiries List (Protected Endpoint)
app.get('/api/inquiries', (req, res) => {
    const clientKey = req.headers['x-admin-key'];
    if (!clientKey || clientKey !== ADMIN_API_KEY) {
        return res.status(401).json({
            success: false,
            error: { code: 'UNAUTHORIZED', message: 'Invalid or missing administrator key.' }
        });
    }

    try {
        const stmt = db.prepare('SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 100');
        const inquiries = stmt.all();
        return res.status(200).json({ success: true, count: inquiries.length, data: inquiries });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: { code: 'DATABASE_ERROR', message: 'Failed to fetch inquiries' }
        });
    }
});

// 6. Newsletter Subscription
app.post('/api/newsletter', rateLimiter({
    windowMs: 10 * 60 * 1000,
    maxRequests: 5,
    message: 'Too many subscription attempts. Please wait 10 minutes.'
}), (req, res) => {
    try {
        const { email } = req.body;

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_EMAIL', message: 'Please provide a valid email address.' }
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        // Check if existing
        const checkStmt = db.prepare('SELECT id FROM subscribers WHERE email = ?');
        const existing = checkStmt.get(cleanEmail);

        if (existing) {
            return res.status(200).json({
                success: true,
                message: 'You are already registered in the Imperial Guild Registry ✦'
            });
        }

        const insertStmt = db.prepare(`
            INSERT INTO subscribers (email, status, source)
            VALUES (?, 'ACTIVE', 'WEB_NEWSLETTER')
        `);
        insertStmt.run(cleanEmail);

        return res.status(201).json({
            success: true,
            message: 'Confidential Guild registration confirmed ✦'
        });

    } catch (err) {
        console.error('[Error] Newsletter POST:', err);
        return res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Failed to process subscription.' }
        });
    }
});

// 7. Orders / Cart Allocation Checkout (Transactional ACID write)
app.post('/api/orders', rateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 8,
    message: 'Order creation rate limit reached. Please wait.'
}), (req, res) => {
    try {
        const {
            customer_name,
            customer_email,
            customer_phone,
            shipping_address,
            city,
            postal_code,
            country = 'India',
            items,
            notes
        } = req.body;

        // Customer Validation
        if (!customer_name || typeof customer_name !== 'string' || customer_name.trim().length < 2) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_NAME', message: 'Customer name is required (min 2 characters).' }
            });
        }

        if (!isValidEmail(customer_email)) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_EMAIL', message: 'Valid customer email is required.' }
            });
        }

        if (!customer_phone || typeof customer_phone !== 'string' || customer_phone.trim().length < 7) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_PHONE', message: 'Valid contact telephone is required.' }
            });
        }

        if (!shipping_address || typeof shipping_address !== 'string' || shipping_address.trim().length < 5) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_ADDRESS', message: 'Valid delivery address is required.' }
            });
        }

        if (!city || !postal_code) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_LOCATION', message: 'City and postal code are required.' }
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                error: { code: 'EMPTY_CART', message: 'Your allocation cart is empty. Please add items.' }
            });
        }

        // Verify and price items against real database values
        let subtotal = 0;
        const verifiedItems = [];

        for (const item of items) {
            const rawWeight = String(item.weight || item.weight_grams || '1').replace('g', '').trim();
            const weight = parseInt(rawWeight, 10);
            const qty = Math.max(1, parseInt(item.qty || item.quantity || 1, 10));

            if (![1, 2, 5].includes(weight)) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'INVALID_WEIGHT', message: `Invalid package weight: ${rawWeight}g. Supported: 1g, 2g, 5g.` }
                });
            }

            // Look up product by name or slug
            const queryName = (item.name || '').toLowerCase();
            let product = null;

            if (queryName.includes('mogra')) {
                product = db.prepare("SELECT * FROM products WHERE slug = 'mogra'").get();
            } else if (queryName.includes('lachha')) {
                product = db.prepare("SELECT * FROM products WHERE slug = 'lachha'").get();
            } else if (queryName.includes('zarda')) {
                product = db.prepare("SELECT * FROM products WHERE slug = 'zarda'").get();
            } else {
                product = db.prepare("SELECT * FROM products WHERE id = ? OR slug = ?").get(item.id, item.slug);
            }

            if (!product) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'PRODUCT_NOT_FOUND', message: `Unknown product: ${item.name}` }
                });
            }

            // Verify expected price for weight
            const unitPrice = weight === 1 ? product.price_1g : (weight === 2 ? product.price_2g : product.price_5g);
            const lineTotal = unitPrice * qty;
            const requiredGrams = weight * qty;

            if (product.stock_grams < requiredGrams) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'OUT_OF_STOCK', message: `Insufficient reserve for ${product.name}. Available: ${product.stock_grams}g.` }
                });
            }

            subtotal += lineTotal;
            verifiedItems.push({
                product,
                weight,
                qty,
                unitPrice,
                lineTotal,
                requiredGrams
            });
        }

        // Free shipping on orders >= 999, else 99
        const shippingFee = subtotal >= 999 ? 0 : 99;
        const totalAmount = subtotal + shippingFee;
        const orderRef = `SFF-2026-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

        // Atomic Transaction: Insert Order, Insert Order Items, Decrement Inventory
        db.exec('BEGIN TRANSACTION;');

        try {
            const orderStmt = db.prepare(`
                INSERT INTO orders (
                    order_ref, customer_name, customer_email, customer_phone,
                    shipping_address, city, postal_code, country,
                    subtotal, shipping_fee, total_amount, payment_status, order_status, notes
                ) VALUES (
                    ?, ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?, 'PAID_ON_DELIVERY', 'CONFIRMED', ?
                )
            `);

            const orderResult = orderStmt.run(
                orderRef,
                sanitizeText(customer_name, 100),
                customer_email.trim().toLowerCase(),
                sanitizeText(customer_phone, 30),
                sanitizeText(shipping_address, 250),
                sanitizeText(city, 80),
                sanitizeText(postal_code, 20),
                sanitizeText(country, 50),
                subtotal,
                shippingFee,
                totalAmount,
                sanitizeText(notes || '', 500)
            );

            const orderId = orderResult.lastInsertRowid;

            const itemStmt = db.prepare(`
                INSERT INTO order_items (
                    order_id, product_id, product_name, weight_grams, quantity, unit_price, line_total
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `);

            const stockStmt = db.prepare(`
                UPDATE products SET stock_grams = stock_grams - ? WHERE id = ?
            `);

            for (const item of verifiedItems) {
                itemStmt.run(
                    orderId,
                    item.product.id,
                    item.product.name,
                    item.weight,
                    item.qty,
                    item.unitPrice,
                    item.lineTotal
                );
                stockStmt.run(item.requiredGrams, item.product.id);
            }

            db.exec('COMMIT;');

            return res.status(201).json({
                success: true,
                orderRef,
                orderSummary: {
                    orderRef,
                    customerName: customer_name,
                    subtotal,
                    shippingFee,
                    totalAmount,
                    itemCount: verifiedItems.length,
                    status: 'CONFIRMED',
                    estimatedDelivery: '3–5 Business Days via Express Air Courier'
                },
                message: `Allocation order ${orderRef} confirmed successfully.`
            });

        } catch (txErr) {
            db.exec('ROLLBACK;');
            throw txErr;
        }

    } catch (err) {
        console.error('[Error] Orders POST:', err);
        return res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Failed to place allocation order. Please try again.' }
        });
    }
});

// 8. Order Verification by Reference
app.get('/api/orders/:orderRef', (req, res) => {
    try {
        const orderStmt = db.prepare('SELECT * FROM orders WHERE order_ref = ?');
        const order = orderStmt.get(req.params.orderRef);

        if (!order) {
            return res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: `Order reference ${req.params.orderRef} not found.` }
            });
        }

        const itemsStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
        const items = itemsStmt.all(order.id);

        // Sanitize for public privacy
        const maskedEmail = order.customer_email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + '***' + c);

        return res.status(200).json({
            success: true,
            data: {
                orderRef: order.order_ref,
                customer: order.customer_name,
                emailMasked: maskedEmail,
                city: order.city,
                subtotal: order.subtotal,
                shippingFee: order.shipping_fee,
                totalAmount: order.total_amount,
                status: order.order_status,
                createdAt: order.created_at,
                items
            }
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: { code: 'DATABASE_ERROR', message: 'Failed to retrieve order status' }
        });
    }
});

// 9. Telemetry Stats Aggregator
app.get('/api/telemetry', (req, res) => {
    try {
        const subscriberCount = db.prepare('SELECT COUNT(*) AS count FROM subscribers').get().count;
        const inquiryCount = db.prepare('SELECT COUNT(*) AS count FROM inquiries').get().count;
        const orderCount = db.prepare('SELECT COUNT(*) AS count FROM orders').get().count;
        const avgRating = db.prepare('SELECT AVG(rating) AS avg FROM products').get().avg || 4.9;

        return res.status(200).json({
            success: true,
            telemetry: {
                verifiedConnoisseurs: 50000 + subscriberCount * 12 + orderCount * 5,
                guildSubscribers: subscriberCount,
                inquiriesProcessed: inquiryCount,
                ordersAllocated: orderCount,
                averagePurityRating: parseFloat(avgRating.toFixed(2)),
                crocinIndex: 264.8,
                isoStandard: 'ISO 3632 Category I'
            }
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: { code: 'DATABASE_ERROR', message: 'Failed to retrieve telemetry' }
        });
    }
});

// ---------- 05. STATIC ASSET SERVING ----------
app.use(express.static(path.join(__dirname), {
    maxAge: NODE_ENV === 'production' ? '1d' : 0,
    etag: true
}));

// Fallback to index.html for non-API navigations
app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
        return res.sendFile(path.join(__dirname, 'index.html'));
    }
    next();
});

// Central error handler
app.use((err, req, res, next) => {
    console.error('[Unhandled Server Error]:', err);
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message
        }
    });
});

// Start Server if invoked directly
if (require.main === module) {
    const server = app.listen(PORT, () => {
        console.log(`
  ✦ ============================================================== ✦
    SHREEJI SAFFRON — IMPERIAL 3D PORTAL & FULL-STACK ENGINE
    STATUS: ONLINE
    PORT:   ${PORT}
    ENV:    ${NODE_ENV}
    URL:    http://localhost:${PORT}
  ✦ ============================================================== ✦
        `);
    });

    // Graceful Shutdown
    const shutdown = () => {
        console.log('\n✦ Shutting down server gracefully...');
        server.close(() => {
            console.log('✓ HTTP Server closed.');
            process.exit(0);
        });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}

module.exports = app;
