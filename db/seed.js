/* ==========================================================================
   SHREEJI SAFFRON — STANDALONE SEED SCRIPT
   Usage: npm run seed
   ========================================================================== */

const { db, initSchema, seedProducts, seedProjects, seedSkills, seedTimeline } = require('./database');

console.log('✦ Initializing Database Schema...');
initSchema();

console.log('✦ Seeding Products, Projects, Skills & Timeline...');
seedProducts();
seedProjects();
seedSkills();
seedTimeline();

const productCount = db.prepare('SELECT COUNT(*) AS count FROM products').get().count;
const projectCount = db.prepare('SELECT COUNT(*) AS count FROM projects').get().count;
const skillCount = db.prepare('SELECT COUNT(*) AS count FROM skills').get().count;
const timelineCount = db.prepare('SELECT COUNT(*) AS count FROM timeline').get().count;
const inquiryCount = db.prepare('SELECT COUNT(*) AS count FROM inquiries').get().count;
const orderCount = db.prepare('SELECT COUNT(*) AS count FROM orders').get().count;
const subCount = db.prepare('SELECT COUNT(*) AS count FROM subscribers').get().count;

console.log(`✓ Database Ready:
  - Projects: ${projectCount}
  - Skills: ${skillCount}
  - Timeline: ${timelineCount}
  - Products: ${productCount}
  - Inquiries: ${inquiryCount}
  - Orders: ${orderCount}
  - Subscribers: ${subCount}
`);

process.exit(0);
