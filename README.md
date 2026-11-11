# Aryan Thakar — Personal Portfolio & Cinematic 3D Experience

> **Creative Developer & Cybersecurity Architect**  
> Synthesizing cinematic 3D spatial environments, resilient full-stack systems, and proactive defensive security architectures.

---

## Architecture Overview

```text
.
|-- index.html              # Modern, semantic portfolio interface & HUD overlays
|-- styles.css              # Obsidian & Quantum Cyan design system (responsive, tokens)
|-- script.js               # Client interaction engine: Audio synthesizers, modals, SOC simulator, Admin
|-- three-scene.js          # Master 3D spatial engine: Quantum Monolith, Cyber Mesh, Specimen Vault
|-- server.js               # Production Express 5 REST API server (Rate-limited, CORS, Security headers)
|-- db/
|   |-- database.js         # Native node:sqlite persistence layer (WAL Mode, Foreign Keys, ACID)
|   `-- seed.js             # Database seeding script for catalog & projects
|-- test/
|   |-- api.test.js         # Integration tests for all portfolio, project, and admin endpoints
|   `-- db.test.js          # In-memory database constraints and transaction tests
|-- images/                 # Optimized vector mockups and product media
|-- robots.txt              # Search engine crawler policies
|-- sitemap.xml             # XML sitemap for SEO discovery
|-- vercel.json             # Vercel serverless deployment configuration
`-- package.json
```

---

## Key Features

1. **Cinematic 3D Quantum Monolith (Hero Centerpiece):**
   - High-performance Three.js WebGL environment.
   - Central faceted sci-fi titanium obelisk with inner pulsing quantum core.
   - Counter-rotating gyroscopic orbital gimbals with telemetry markers.
   - 4 floating satellite domain nodes representing 3D Web, Full-Stack, CCNA Network Security, and CEH Threat Defense.
   - Dual helical stardust particle constellation (1,400 points).
   - Mouse inertia damping, smooth parallax, camera flythrough on scroll, and interactive double-click/button warp pulse.
   - Automatic 60FPS throttling via `IntersectionObserver` when scrolled offscreen.
   - Graceful CSS/SVG animated fallback for non-WebGL environments.

2. **Editorial Biography & Philosophy (About Archive):**
   - Real biography and academic background of Aryan Rakesh Thakar.
   - B.Sc. in Computer Science (2026) graduate from Nirmala Memorial Foundation College, Mumbai.
   - Dual-domain philosophy connecting visual spatial ambition with system-level defensibility.
   - Live telemetry terminal HUD with verified academic and professional credentials.

3. **Flagship Production Vault (Projects Showcase):**
   - Filterable showcase by domain: `ALL`, `3D & CREATIVE WEB`, `FULL-STACK SAAS`, `CYBERSECURITY & SOC`, `SYSTEMS & RESEARCH`.
   - Real, authentic projects with live demo modals, technical stack tags, and direct GitHub links:
     - **Shreeji Saffron 3D Portal & E-Commerce** (Three.js shaders, WebGL, Express 5, SQLite WAL)
     - **HEALTHKRAFT Studio Management & CRM** (React 19, Tailwind, Node.js, Express, MySQL)
     - **PhisGuard / Hackify Threat Intelligence** (React 19, Recharts, Vite, Node.js)
     - **SOC Threat Detection Lab Simulation** (Wireshark PCAP analysis, SIEM, Suricata IDS, NIST playbooks)
     - **Cryptographic Image Steganography Suite** (Python, OpenCV, Cryptography, LSB embedding)
     - **Cyber Challenge Arena** (OWASP Top 10 gamified interactive security training)

4. **Technical Arsenal & 3D Cyber Threat Mesh (Skills):**
   - 4 categorized competencies with animated progress meters and descriptions.
   - Dedicated 3D interactive Cyber Threat Network Mesh canvas (`#cyberCanvas`) allowing users to rotate and inspect network topology.

5. **Milestones & Credentials Timeline:**
   - Chronological roadmap covering B.Sc. Computer Science degree, Cisco CCNA, EC-Council CEH, Codewarts Hackathons, and production deployments.

6. **Defensive Security & SOC Lab Simulation:**
   - Real-time interactive SOC packet feed simulating Wireshark and SIEM event streams.
   - Interactive "SIMULATE ATTACK" button triggers realistic threat alerts (SQLi, SYN flood, SSH brute-force, DNS exfiltration).
   - "CLEAR LOGS" resets to baseline.

7. **Contact Concierge Terminal:**
   - Real-time client and server-side validated contact form.
   - Anti-spam honeypot protection.
   - Direct persistence into SQLite `inquiries` table with unique reference codes (`INQ-2026-XXXX`).
   - Direct communication channels: Email, WhatsApp/Phone, GitHub.

8. **Secure Admin Management Terminal (`/admin`):**
   - Secure authentication via `POST /api/admin/auth` with `ADMIN_API_KEY`.
   - Inquiries inbox with status updates (`NEW`, `REVIEWED`, `REPLIED`, `ARCHIVED`).
   - Projects manager with live view counters.
   - System telemetry metrics (memory RSS, node uptime, total inquiries, total views).

---

## Local Setup & Development

### Requirements
- Node.js 22 or later (for built-in `node:sqlite`)
- npm

### Installation & Run
```powershell
# 1. Install dependencies
npm install

# 2. Configure environment
Copy-Item .env.example .env

# 3. Seed database
npm run seed

# 4. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## REST API Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | System status and database connectivity |
| `GET` | `/api/projects` | Public | List portfolio projects (filterable by `?category=...`) |
| `GET` | `/api/projects/:slug` | Public | Retrieve single project details & increment view count |
| `GET` | `/api/skills` | Public | Retrieve categorized skills list |
| `GET` | `/api/timeline` | Public | Retrieve professional timeline milestones |
| `POST` | `/api/inquiries` | Public (Rate-limited) | Submit contact dispatch (persisted to SQLite) |
| `POST` | `/api/admin/auth` | Public (Rate-limited) | Authenticate administrator secret key |
| `GET` | `/api/inquiries` | Admin Only | List all contact inquiries |
| `PATCH` | `/api/admin/inquiries/:id` | Admin Only | Update inquiry status |
| `POST` | `/api/admin/projects` | Admin Only | Create new portfolio project |
| `PUT` | `/api/admin/projects/:id` | Admin Only | Update existing portfolio project |
| `DELETE` | `/api/admin/projects/:id` | Admin Only | Delete portfolio project |
| `GET` | `/api/admin/stats` | Admin Only | Overview system and telemetry statistics |
| `GET` | `/api/telemetry` | Public | High-level application telemetry |

*Admin endpoints require either the `x-admin-key: <ADMIN_API_KEY>` header or `Authorization: Bearer <ADMIN_API_KEY>` header.*

---

## Automated Test Suite

Run the full automated test suite (14/14 tests covering API endpoints, validation, database transactions, constraints, and admin lifecycle):

```powershell
npm test
```

---

## Deployment Instructions

### Vercel Deployment
1. Connect the repository `AryanThakar860/Saffron` on [Vercel](https://vercel.com).
2. Configure the following Environment Variables in Vercel Project Settings:
   - `ADMIN_API_KEY`: Set your secure unique administrator key.
   - `ALLOWED_ORIGINS`: Add your production domain (e.g. `https://aryanthakar.dev,https://saffron.vercel.app`).
   - `NODE_ENV`: `production`
3. Vercel automatically deploys using `vercel.json` and `@vercel/node`. The SQLite database automatically initializes inside `/tmp/saffron.db` for ephemeral serverless execution.

### GitHub Actions / Automatic Deploy
- Pushes to the `main` branch automatically trigger Vercel preview or production deployments.

---

## Author & Credentials

**Aryan Rakesh Thakar**  
- **Email:** `aryanthakar3@gmail.com` | `thakararyan267@gmail.com`  
- **Phone:** `+91 9326858681`  
- **GitHub:** [https://github.com/AryanThakar860](https://github.com/AryanThakar860)  
- **Location:** Mumbai, Maharashtra, India  
- **Certifications:** Cisco Certified Network Associate (CCNA) &bull; Certified Ethical Hacker (CEH)  
- **Education:** B.Sc. in Computer Science (2026), Nirmala Memorial Foundation College of Science & Commerce, Mumbai
