/* ==========================================================================
   SHREEJI SAFFRON — STANDALONE SEED SCRIPT
   Usage: npm run seed
   ========================================================================== */

const { db, initSchema, seedProducts } = require('./database');

console.log('✦ Initializing Database Schema...');
initSchema();

console.log('✦ Seeding Products...');
seedProducts();

const productCount = db.prepare('SELECT COUNT(*) AS count FROM products').get().count;
const inquiryCount = db.prepare('SELECT COUNT(*) AS count FROM inquiries').get().count;
const orderCount = db.prepare('SELECT COUNT(*) AS count FROM orders').get().count;
const subCount = db.prepare('SELECT COUNT(*) AS count FROM subscribers').get().count;

console.log(`✓ Database Ready:
  - Products: ${productCount}
  - Inquiries: ${inquiryCount}
  - Orders: ${orderCount}
  - Subscribers: ${subCount}
`);

process.exit(0);
