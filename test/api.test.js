/* ==========================================================================
   SHREEJI SAFFRON — API INTEGRATION TEST SUITE
   Tests all REST endpoints, validation rules, security keys, and data flows
   ========================================================================== */

const test = require('node:test');
const assert = require('node:assert');
const app = require('../server');

let server;
let baseUrl;

test.before(async () => {
    await new Promise((resolve) => {
        server = app.listen(0, () => {
            const port = server.address().port;
            baseUrl = `http://127.0.0.1:${port}`;
            resolve();
        });
    });
});

test.after(async () => {
    if (server) {
        await new Promise((resolve) => server.close(resolve));
    }
});

test('GET /api/health -> returns healthy status and DB connectivity', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.status, 'healthy');
    assert.strictEqual(body.database, 'connected');
    assert.strictEqual(typeof body.uptime_seconds, 'number');
});

test('GET /api/products -> returns active product catalog', async () => {
    const res = await fetch(`${baseUrl}/api/products`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert(Array.isArray(body.data));
    assert(body.data.length >= 3);

    const mogra = body.data.find(p => p.slug === 'mogra');
    assert(mogra);
    assert.strictEqual(mogra.price_1g, 599);
    assert.strictEqual(mogra.price_2g, 1099);
    assert.strictEqual(mogra.price_5g, 2499);
});

test('GET /api/products/:slug -> returns product or 404', async () => {
    // Valid product
    const res = await fetch(`${baseUrl}/api/products/mogra`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.slug, 'mogra');

    // Invalid product
    const res404 = await fetch(`${baseUrl}/api/products/unknown_product_xyz`);
    assert.strictEqual(res404.status, 404);
});

test('POST /api/inquiries -> validates input and logs dispatch', async () => {
    // 1. Invalid input: missing name
    const resBad = await fetch(`${baseUrl}/api/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '', email: 'test@example.com', message: 'Hello this is a test' })
    });
    assert.strictEqual(resBad.status, 400);

    // 2. Invalid input: invalid email
    const resBadEmail = await fetch(`${baseUrl}/api/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Valid Name', email: 'not-an-email', message: 'Hello this is a test' })
    });
    assert.strictEqual(resBadEmail.status, 400);

    // 3. Valid submission
    const resValid = await fetch(`${baseUrl}/api/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Lord Alistair Vance',
            email: 'vance@heritage.com',
            phone: '+91 98765 43210',
            subject: 'wholesale',
            message: 'Inquiring regarding private autumn reserve allocation.'
        })
    });
    assert.strictEqual(resValid.status, 201);
    const body = await resValid.json();
    assert.strictEqual(body.success, true);
    assert(body.inquiryRef.startsWith('INQ-2026-'));
});

test('GET /api/inquiries -> protects admin route with key', async () => {
    // Unauthorized without key
    const resUnauth = await fetch(`${baseUrl}/api/inquiries`);
    assert.strictEqual(resUnauth.status, 401);

    // Authorized with admin key
    const resAuth = await fetch(`${baseUrl}/api/inquiries`, {
        headers: { 'x-admin-key': process.env.ADMIN_API_KEY || 'shreeji_secret_admin_key_2026' }
    });
    assert.strictEqual(resAuth.status, 200);
    const body = await resAuth.json();
    assert.strictEqual(body.success, true);
    assert(Array.isArray(body.data));
});

test('POST /api/newsletter -> registers subscriber idempotently', async () => {
    const testEmail = `guild_${Date.now()}@example.com`;

    // First registration
    const res1 = await fetch(`${baseUrl}/api/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail })
    });
    assert.strictEqual(res1.status, 201);
    const body1 = await res1.json();
    assert.strictEqual(body1.success, true);

    // Duplicate registration (idempotent 200)
    const res2 = await fetch(`${baseUrl}/api/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail })
    });
    assert.strictEqual(res2.status, 200);
    const body2 = await res2.json();
    assert.strictEqual(body2.success, true);
});

test('POST /api/orders -> processes cart checkout with stock updates', async () => {
    // 1. Missing fields check
    const resBad = await fetch(`${baseUrl}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_name: '' })
    });
    assert.strictEqual(resBad.status, 400);

    // 2. Valid Order: 1g Mogra (₹599) + 2g Lachha (₹849) = ₹1448 (Free shipping > ₹999)
    const resValid = await fetch(`${baseUrl}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            customer_name: 'Priya Kapoor',
            customer_email: 'priya@gastronomy.com',
            customer_phone: '+91 98765 11111',
            shipping_address: 'Flat 4B, Imperial Residency, Marine Drive',
            city: 'Mumbai',
            postal_code: '400020',
            country: 'India',
            items: [
                { name: 'Mogra Saffron', weight: '1', qty: 1 },
                { name: 'Lachha Saffron', weight: '2', qty: 1 }
            ]
        })
    });

    assert.strictEqual(resValid.status, 201);
    const body = await resValid.json();
    assert.strictEqual(body.success, true);
    assert(body.orderRef.startsWith('SFF-2026-'));
    assert.strictEqual(body.orderSummary.subtotal, 599 + 849);
    assert.strictEqual(body.orderSummary.shippingFee, 0); // >= 999 is free
    assert.strictEqual(body.orderSummary.totalAmount, 1448);

    // 3. Verify order lookup
    const resLookup = await fetch(`${baseUrl}/api/orders/${body.orderRef}`);
    assert.strictEqual(resLookup.status, 200);
    const lookupBody = await resLookup.json();
    assert.strictEqual(lookupBody.data.orderRef, body.orderRef);
    assert.strictEqual(lookupBody.data.items.length, 2);
});

test('GET /api/telemetry -> returns aggregated statistics', async () => {
    const res = await fetch(`${baseUrl}/api/telemetry`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert(body.telemetry.verifiedConnoisseurs >= 50000);
    assert(body.telemetry.crocinIndex >= 250);
});
