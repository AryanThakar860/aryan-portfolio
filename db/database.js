/* ==========================================================================
   SHREEJI SAFFRON — DATABASE MANAGEMENT & PERSISTENCE LAYER
   Powered by Node.js Native SQLite (ACID Compliant, WAL Mode)
   ========================================================================== */

const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

// Ensure data directory exists (support Vercel serverless /tmp environment)
const isVercel = Boolean(process.env.VERCEL);
const dataDir = isVercel ? '/tmp' : path.join(__dirname, '..', 'data');
if (!isVercel && !fs.existsSync(dataDir)) {
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

        -- 6. PROJECTS TABLE (Aryan Thakar's Real Portfolio Works)
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            slug TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            tagline TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            tech_stack TEXT NOT NULL,
            live_url TEXT,
            github_url TEXT,
            image_url TEXT NOT NULL,
            badge TEXT,
            featured INTEGER NOT NULL DEFAULT 1,
            order_index INTEGER NOT NULL DEFAULT 0,
            views_count INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- 7. SKILLS TABLE (Categorized Real Technical Capabilities)
        CREATE TABLE IF NOT EXISTS skills (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            proficiency INTEGER NOT NULL DEFAULT 90,
            description TEXT NOT NULL,
            icon TEXT,
            order_index INTEGER NOT NULL DEFAULT 0
        );

        -- 8. TIMELINE TABLE (Career Milestones, CCNA/CEH Certifications, Education)
        CREATE TABLE IF NOT EXISTS timeline (
            id TEXT PRIMARY KEY,
            year TEXT NOT NULL,
            period TEXT NOT NULL,
            title TEXT NOT NULL,
            organization TEXT NOT NULL,
            type TEXT NOT NULL,
            description TEXT NOT NULL,
            badge TEXT,
            order_index INTEGER NOT NULL DEFAULT 0
        );

        -- INDEXES FOR PERFORMANCE
        CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
        CREATE INDEX IF NOT EXISTS idx_inquiries_ref ON inquiries(inquiry_ref);
        CREATE INDEX IF NOT EXISTS idx_inquiries_email ON inquiries(email);
        CREATE INDEX IF NOT EXISTS idx_orders_ref ON orders(order_ref);
        CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
        CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
        CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
        CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
        CREATE INDEX IF NOT EXISTS idx_timeline_year ON timeline(year);
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

/**
 * Seed initial real projects data if table is empty
 */
function seedProjects() {
    const countQuery = db.prepare('SELECT COUNT(*) AS total FROM projects');
    const result = countQuery.get();
    if (result && result.total > 0) return;

    const insert = db.prepare(`
        INSERT INTO projects (
            id, slug, title, tagline, category, description,
            tech_stack, live_url, github_url, image_url, badge,
            featured, order_index, views_count
        ) VALUES (
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?
        )
    `);

    const initialProjects = [
        [
            'proj_saffron',
            'shreeji-saffron-3d',
            'Shreeji Saffron — 3D Botanical Portal & E-Commerce',
            'Cinematic WebGL & Three.js Storefront with ACID Transaction Engine',
            '3d-creative',
            'An immersive high-performance digital flagship featuring procedural WebGL shaders, kinetic botanical centerpieces, real-time liquid saffron infusion physics, synthesized ambient audio, and an Express 5 + SQLite WAL order checkout pipeline.',
            JSON.stringify(['Three.js', 'WebGL', 'GLSL', 'Express 5', 'Node:sqlite', 'GSAP', 'Web Audio API']),
            '#saffron-experience',
            'https://github.com/AryanThakar860/Saffron',
            'images/hero-banner.png',
            'FLAGSHIP 3D',
            1, 1, 1420
        ],
        [
            'proj_healthkraft',
            'healthkraft-crm',
            'HEALTHKRAFT — Studio Management & CRM Platform',
            'Enterprise Multi-Tenant SaaS with 5 Role Dashboards & SEO Engine',
            'full-stack',
            'Complete wellness and studio operating system engineered with React, Express, and MySQL. Features 5 distinct RBAC panels (Super Admin, Admin, Manager, Receptionist, Trainer), public server-side metadata generator for Google crawlers, automated backups, and billing telemetry.',
            JSON.stringify(['React', 'Node.js', 'Express', 'MySQL', 'Tailwind CSS', 'Vite', 'REST API']),
            '#healthkraft-modal',
            'https://github.com/AryanThakar860',
            'images/healthkraft-preview.svg',
            'FULL-STACK SAAS',
            1, 2, 980
        ],
        [
            'proj_phisguard',
            'phisguard-hackify',
            'PhisGuard // Threat Intelligence & Phishing Analytics',
            'Real-Time Cybersecurity Threat Telemetry & Attack Vector Dissection',
            'cybersecurity',
            'Cybersecurity intelligence dashboard developed for real-time phishing risk scoring, domain heuristic evaluation, URL entropy calculation, and employee threat awareness simulation. Built with React 19 and data visualization engines.',
            JSON.stringify(['React 19', 'Recharts', 'Vite', 'Node.js', 'Security Analytics', 'Lucide']),
            '#phisguard-modal',
            'https://github.com/AryanThakar860',
            'images/phisguard-preview.svg',
            'SECURITY INTEL',
            1, 3, 1150
        ],
        [
            'proj_soclab',
            'soc-threat-detection-lab',
            'SOC & Threat Detection Lab Simulation',
            'Network Security Monitoring, Packet Forensics & Alert Triage',
            'cybersecurity',
            'Simulated Security Operations Center environment analyzing live PCAP packet captures, detecting port sweeps and unauthorized SSH brute-force anomalies, and executing NIST SP 800-61 incident response playbooks using open-source SIEM and IDS stacks.',
            JSON.stringify(['Wireshark', 'Splunk / ELK', 'Nmap', 'Kali Linux', 'Suricata', 'Incident Response']),
            '#soclab-modal',
            'https://github.com/AryanThakar860',
            'images/soc-preview.svg',
            'DEFENSIVE SEC',
            1, 4, 870
        ],
        [
            'proj_stego',
            'cryptographic-steganography',
            'Cryptographic Image Steganography Suite',
            'High-Assurance Confidential Data Embedding & Cryptographic Extraction',
            'systems',
            'Academic cryptography research project implementing Least Significant Bit (LSB) carrier plane embedding. Injects AES-256 encrypted payloads into lossless image matrices with zero perceptual distortion and cryptographic HMAC verification.',
            JSON.stringify(['Python', 'OpenCV', 'Cryptography', 'LSB Steganography', 'SHA-256', 'PIL']),
            '#stego-modal',
            'https://github.com/AryanThakar860',
            'images/stego-preview.svg',
            'CIPHER RESEARCH',
            1, 5, 640
        ],
        [
            'proj_cybergame',
            'cyber-challenge-arena',
            'Cyber Challenge Arena — Gamified Security Training',
            'Interactive OWASP Top 10 Defense Simulator & Capture-The-Flag Challenges',
            'systems',
            'Gamified cyber defense platform presenting real-time vulnerable scenarios (SQL Injection, Stored XSS, JWT header stripping, Insecure Deserialization) to teach software engineers proactive defense and secure coding standards.',
            JSON.stringify(['JavaScript', 'Canvas API', 'OWASP Top 10', 'Web Security', 'Gamification']),
            '#cybergame-modal',
            'https://github.com/AryanThakar860',
            'images/cybergame-preview.svg',
            'SECURITY EDTECH',
            1, 6, 920
        ]
    ];

    for (const proj of initialProjects) {
        insert.run(...proj);
    }
}

/**
 * Seed initial real skills data if table is empty
 */
function seedSkills() {
    const countQuery = db.prepare('SELECT COUNT(*) AS total FROM skills');
    const result = countQuery.get();
    if (result && result.total > 0) return;

    const insert = db.prepare(`
        INSERT INTO skills (id, name, category, proficiency, description, icon, order_index)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const initialSkills = [
        // 1. Creative Web & 3D
        ['sk_three', 'Three.js & WebGL Shaders', '3d-frontend', 95, 'Procedural geometry, GLSL shaders, camera choreography, and custom lighting.', 'cube', 1],
        ['sk_gsap', 'GSAP & ScrollTrigger', '3d-frontend', 95, 'Timeline-based complex motion graphics, scroll-linked canvas scrubbing, and magnetic physics.', 'zap', 2],
        ['sk_canvas', 'HTML5 Canvas & Web Audio API', '3d-frontend', 90, 'Dynamic particle engines, custom synthesizers, and procedural audio feedback.', 'volume-2', 3],
        ['sk_css', 'Modern CSS Architecture & Tokens', '3d-frontend', 96, 'Design systems, responsive flex/grid layouts, GPU-accelerated compositing, and dark aesthetics.', 'palette', 4],

        // 2. Full-Stack Engineering
        ['sk_node', 'Node.js & Express 5', 'fullstack', 96, 'High-concurrency microservices, robust REST APIs, security middleware, and streaming.', 'server', 5],
        ['sk_react', 'React 19 & Component Architecture', 'fullstack', 92, 'State management, custom hooks, virtual DOM optimization, and component lifecycles.', 'code', 6],
        ['sk_sql', 'SQLite (WAL) & MySQL Databases', 'fullstack', 93, 'Relational schema design, ACID transactions, complex joins, and migration management.', 'database', 7],
        ['sk_api', 'RESTful API & Server Security', 'fullstack', 95, 'Rate limiting, input validation, CORS headers, honeypots, and token authentication.', 'shield-check', 8],

        // 3. Network Security & SOC
        ['sk_ccna', 'CCNA Network Engineering', 'security', 94, 'TCP/IP, OSI, routing protocols (OSPF, BGP), VLANs, subnetting, and ACLs.', 'network', 9],
        ['sk_ceh', 'CEH Offensive & Defensive Vectors', 'security', 92, 'Reconnaissance, vulnerability analysis, web exploitation, and mitigation strategies.', 'shield-alert', 10],
        ['sk_soc', 'SOC Alert Triage & Incident Playbooks', 'security', 90, 'Security event correlation, incident escalation, and triage under standard playbooks.', 'activity', 11],
        ['sk_pcap', 'Wireshark & Packet Forensics', 'security', 93, 'Deep packet inspection, protocol analysis, beacon detection, and malicious traffic parsing.', 'radio', 12],

        // 4. DevOps, Systems & Tools
        ['sk_linux', 'Linux & Kali Toolset', 'devops', 92, 'Bash scripting, server configuration, network debugging, and forensic tooling.', 'terminal', 13],
        ['sk_git', 'Git & CI/CD Pipelines', 'devops', 95, 'Version control workflows, trunk-based branching, and GitHub deployment pipelines.', 'git-branch', 14],
        ['sk_sec', 'OWASP Top 10 Mitigation', 'devops', 94, 'Defense-in-depth against XSS, SQLi, CSRF, insecure tokens, and SSRF.', 'lock', 15],
        ['sk_python', 'Python Scripting & Cryptography', 'devops', 88, 'Automation, cryptographic hashing (SHA-256, AES), and data analysis.', 'cpu', 16]
    ];

    for (const sk of initialSkills) {
        insert.run(...sk);
    }
}

/**
 * Seed initial real timeline data if table is empty
 */
function seedTimeline() {
    const countQuery = db.prepare('SELECT COUNT(*) AS total FROM timeline');
    const result = countQuery.get();
    if (result && result.total > 0) return;

    const insert = db.prepare(`
        INSERT INTO timeline (id, year, period, title, organization, type, description, badge, order_index)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const initialTimeline = [
        [
            'time_bsc',
            '2026',
            'Graduated June 2026',
            'B.Sc. in Computer Science',
            'Nirmala Memorial Foundation College of Science & Commerce, Mumbai',
            'education',
            'Completed rigorous degree in Computer Science with distinction. Built foundational expertise in algorithms, relational databases, network engineering, and information security.',
            'DEGREE COMPLETED',
            1
        ],
        [
            'time_ccna',
            '2026',
            'Professional Credential',
            'Cisco Certified Network Associate (CCNA)',
            'Cisco Systems',
            'certification',
            'Certified across enterprise networking fundamentals: IP connectivity, IP services, security fundamentals, network automation, VLANs, switching, and routing architectures.',
            'CCNA CERTIFIED',
            2
        ],
        [
            'time_ceh',
            '2026',
            'Security Credential',
            'Certified Ethical Hacker (CEH)',
            'EC-Council',
            'certification',
            'Certified in modern ethical hacking methodologies: network scanning, system exploitation, web application security, perimeter defense, and vulnerability assessment.',
            'CEH CERTIFIED',
            3
        ],
        [
            'time_hackathon',
            '2026',
            'Technical Competition',
            'Codewarts Hackathon & Technical Competitions',
            'Codewarts / University Hackathons',
            'achievement',
            'Engineered full-stack and security-first prototypes under intense time constraints; awarded Certificate of Technical Excellence and Participation.',
            'HACKATHON MERIT',
            4
        ],
        [
            'time_fullstack',
            '2026',
            'Flagship Engineering',
            'Full-Stack & 3D Interactive Engineering',
            'Independent Client & Research Projects',
            'experience',
            'Architected and shipped production-grade software including HEALTHKRAFT Studio CRM, PhisGuard Threat Platform, and the Shreeji Saffron 3D interactive application.',
            'PRODUCTION SHIPPED',
            5
        ]
    ];

    for (const t of initialTimeline) {
        insert.run(...t);
    }
}

// Auto-run schema initialization and seeding
initSchema();
seedProducts();
seedProjects();
seedSkills();
seedTimeline();

module.exports = {
    db,
    initSchema,
    seedProducts,
    seedProjects,
    seedSkills,
    seedTimeline
};
