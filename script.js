/* ==========================================================================
   ARYAN THAKAR — MASTER CLIENT INTERACTION & SYSTEM ENGINE
   Audio Synthesizer | Magnetic Cursor | Project Modal | SOC Lab | Admin Console
   ========================================================================== */

window.lerp = (a, b, t) => a + (b - a) * t;
window.clamp = (val, min, max) => Math.max(min, Math.min(max, val));

document.addEventListener('DOMContentLoaded', () => {

    const lerp = window.lerp;
    const clamp = window.clamp;

    // ==========================================================================
    //  01. WEB AUDIO API SYNTHESIZER (PROCEDURAL SCI-FI SOUNDS)
    // ==========================================================================
    let audioCtx = null;
    let isAudioOn = false;
    let ambientGain = null;
    let osc1 = null, osc2 = null;

    function initAudio() {
        if (audioCtx) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
    }

    const soundFX = {
        playClick: () => {
            if (!isAudioOn || !audioCtx) return;
            try {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.05);

                gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);

                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.05);
            } catch (e) {}
        },

        playBloom: () => {
            if (!isAudioOn || !audioCtx) return;
            try {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(220, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.8);

                gain.gain.setValueAtTime(0.14, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.9);

                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.9);
            } catch (e) {}
        },

        playInfuse: () => {
            if (!isAudioOn || !audioCtx) return;
            try {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(520, audioCtx.currentTime);
                osc.frequency.linearRampToValueAtTime(680, audioCtx.currentTime + 0.4);

                gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.5);
            } catch (e) {}
        },

        startAmbient: () => {
            if (!audioCtx) return;
            try {
                ambientGain = audioCtx.createGain();
                ambientGain.gain.setValueAtTime(0.03, audioCtx.currentTime);

                osc1 = audioCtx.createOscillator();
                osc2 = audioCtx.createOscillator();

                osc1.type = 'sine';
                osc1.frequency.setValueAtTime(110, audioCtx.currentTime); // A2

                osc2.type = 'triangle';
                osc2.frequency.setValueAtTime(164.81, audioCtx.currentTime); // E3

                const filter = audioCtx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(320, audioCtx.currentTime);

                osc1.connect(filter);
                osc2.connect(filter);
                filter.connect(ambientGain);
                ambientGain.connect(audioCtx.destination);

                osc1.start();
                osc2.start();
            } catch (e) {}
        },

        stopAmbient: () => {
            if (ambientGain && audioCtx) {
                try {
                    ambientGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
                    setTimeout(() => {
                        if (osc1) { osc1.stop(); osc1.disconnect(); }
                        if (osc2) { osc2.stop(); osc2.disconnect(); }
                    }, 350);
                } catch (e) {}
            }
        }
    };

    window.soundFX = soundFX;

    // Audio HUD Toggle
    const audioBtn = document.getElementById('audioToggleBtn');
    const audioLabel = document.getElementById('audioLabel');

    if (audioBtn) {
        audioBtn.addEventListener('click', () => {
            initAudio();
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            isAudioOn = !isAudioOn;
            audioBtn.classList.toggle('active', isAudioOn);

            if (isAudioOn) {
                audioLabel.textContent = 'AUDIO: ON';
                soundFX.startAmbient();
                soundFX.playClick();
            } else {
                audioLabel.textContent = 'AUDIO: OFF';
                soundFX.stopAmbient();
            }
        });
    }

    // ==========================================================================
    //  02. SCI-FI HOLOGRAPHIC CURSOR WITH MAGNETIC ATTRACTION
    // ==========================================================================
    const cursorDot = document.getElementById('cursorDot');
    const cursorRing = document.getElementById('cursorRing');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (cursorDot) {
            cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
        }
    }, { passive: true });

    function renderCursor() {
        ringX = lerp(ringX, mouseX, 0.16);
        ringY = lerp(ringY, mouseY, 0.16);

        if (cursorRing) {
            cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;
        }
        requestAnimationFrame(renderCursor);
    }
    renderCursor();

    const interactiveSelectors = 'a, button, .project-card, .domain-chip, .skill-category-card, .timeline-card, input, select, textarea';
    function attachCursorHover() {
        document.querySelectorAll(interactiveSelectors).forEach(el => {
            el.addEventListener('mouseenter', () => {
                if (cursorRing) cursorRing.classList.add('cursor-hover');
                soundFX.playClick();
            });
            el.addEventListener('mouseleave', () => {
                if (cursorRing) cursorRing.classList.remove('cursor-hover');
            });
        });
    }
    attachCursorHover();

    // ==========================================================================
    //  03. BOOT SPLASH SCREEN
    // ==========================================================================
    const splashScreen = document.getElementById('splashScreen');
    if (splashScreen) {
        setTimeout(() => {
            splashScreen.classList.add('fade-out');
            setTimeout(() => {
                splashScreen.style.display = 'none';
            }, 800);
        }, 1600);
    }

    // ==========================================================================
    //  04. NAVBAR SCROLL & SECTION SPY
    // ==========================================================================
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Section Spy
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 200;

        sections.forEach(sec => {
            const top = sec.offsetTop;
            const height = sec.offsetHeight;
            const id = sec.getAttribute('id');

            if (scrollPosition >= top && scrollPosition < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { passive: true });

    // Mobile Hamburger Toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Scroll to Top Button
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ==========================================================================
    //  05. PROJECT FILTERING CONTROLS
    // ==========================================================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            soundFX.playClick();

            const filter = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(15px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // ==========================================================================
    //  06. PROJECT ARCHITECTURE DETAILS MODAL
    // ==========================================================================
    const projectModal = document.getElementById('projectModal');
    const projectModalClose = document.getElementById('projectModalClose');
    const projectModalBackdrop = document.getElementById('projectModalBackdrop');

    const modalProjectBadge = document.getElementById('modalProjectBadge');
    const modalProjectTitle = document.getElementById('modalProjectTitle');
    const modalProjectSubtitle = document.getElementById('modalProjectSubtitle');
    const modalProjectImg = document.getElementById('modalProjectImg');
    const modalProjectDesc = document.getElementById('modalProjectDesc');
    const modalProjectStack = document.getElementById('modalProjectStack');
    const modalProjectLive = document.getElementById('modalProjectLive');
    const modalProjectGit = document.getElementById('modalProjectGit');

    function openProjectModal(slug) {
        soundFX.playClick();

        // Fetch project specs from backend API
        fetch(`/api/projects/${slug}`)
            .then(res => res.json())
            .then(res => {
                if (!res.success || !res.data) return;
                const p = res.data;

                if (modalProjectBadge) modalProjectBadge.textContent = p.badge || 'SYSTEM ARCHITECTURE';
                if (modalProjectTitle) modalProjectTitle.textContent = p.title;
                if (modalProjectSubtitle) modalProjectSubtitle.textContent = p.tagline;
                if (modalProjectImg) modalProjectImg.src = p.image_url;
                if (modalProjectDesc) modalProjectDesc.textContent = p.description;

                if (modalProjectStack) {
                    modalProjectStack.innerHTML = '';
                    (p.tech_stack || []).forEach(tech => {
                        const span = document.createElement('span');
                        span.className = 'stack-tag';
                        span.textContent = tech;
                        modalProjectStack.appendChild(span);
                    });
                }

                if (modalProjectLive) {
                    modalProjectLive.href = p.live_url || '#';
                    if (p.slug === 'shreeji-saffron-3d') {
                        modalProjectLive.href = '#';
                        modalProjectLive.onclick = (e) => {
                            e.preventDefault();
                            closeProjectModal();
                            openSaffronLabModal();
                        };
                    } else {
                        modalProjectLive.onclick = null;
                    }
                }

                if (modalProjectGit) {
                    modalProjectGit.href = p.github_url || 'https://github.com/AryanThakar860';
                }

                if (projectModal) {
                    projectModal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            })
            .catch(err => {
                console.error('[Error] Project details fetch failed:', err);
            });
    }

    function closeProjectModal() {
        if (projectModal) {
            projectModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    document.querySelectorAll('.open-case-study').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const slug = btn.getAttribute('data-slug');
            if (slug) openProjectModal(slug);
        });
    });

    if (projectModalClose) projectModalClose.addEventListener('click', closeProjectModal);
    if (projectModalBackdrop) projectModalBackdrop.addEventListener('click', closeProjectModal);

    // ==========================================================================
    //  07. SAFFRON 3D INTERACTIVE LAB MODAL
    // ==========================================================================
    const saffronLabModal = document.getElementById('saffronLabModal');
    const saffronLabClose = document.getElementById('saffronLabClose');
    const saffronLabBackdrop = document.getElementById('saffronLabBackdrop');

    function openSaffronLabModal() {
        soundFX.playClick();
        if (saffronLabModal) {
            saffronLabModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeSaffronLabModal() {
        if (saffronLabModal) {
            saffronLabModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    document.querySelectorAll('.open-saffron-demo').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openSaffronLabModal();
        });
    });

    if (saffronLabClose) saffronLabClose.addEventListener('click', closeSaffronLabModal);
    if (saffronLabBackdrop) saffronLabBackdrop.addEventListener('click', closeSaffronLabModal);

    // ==========================================================================
    //  08. RESUME VIEWER MODAL
    // ==========================================================================
    const resumeModal = document.getElementById('resumeModal');
    const openResumeBtn = document.getElementById('openResumeBtn');
    const resumeModalClose = document.getElementById('resumeModalClose');
    const resumeModalBackdrop = document.getElementById('resumeModalBackdrop');

    function openResume() {
        soundFX.playClick();
        if (resumeModal) {
            resumeModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeResume() {
        if (resumeModal) {
            resumeModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    if (openResumeBtn) openResumeBtn.addEventListener('click', openResume);
    if (resumeModalClose) resumeModalClose.addEventListener('click', closeResume);
    if (resumeModalBackdrop) resumeModalBackdrop.addEventListener('click', closeResume);

    // ==========================================================================
    //  09. SOC DEFENSE & THREAT LAB SIMULATOR
    // ==========================================================================
    const simAttackBtn = document.getElementById('simAttackBtn');
    const clearLogBtn = document.getElementById('clearLogBtn');
    const socFeedRows = document.getElementById('socFeedRows');

    const simulatedIncidents = [
        {
            proto: 'HTTP',
            class: 'proto-http',
            src: '45.133.1.28:51022',
            dst: '10.0.0.15:80',
            event: 'SQL INJECTION ATTEMPT: " UNION SELECT table_name FROM information_schema.tables --',
            action: 'BLOCKED',
            actionClass: 'act-block',
            rowClass: 'row-alert'
        },
        {
            proto: 'TCP',
            class: 'proto-tcp',
            src: '198.51.100.44:39102',
            dst: '10.0.0.15:443',
            event: 'SYN FLOOD THRESHOLD EXCEEDED: 4,200 packets/sec on VIP interface',
            action: 'RATE-LIMITED',
            actionClass: 'act-inspect',
            rowClass: 'row-warn'
        },
        {
            proto: 'DNS',
            class: 'proto-dns',
            src: '10.0.0.15:61902',
            dst: '8.8.8.8:53',
            event: 'DNS EXFILTRATION SUSPECTED: High entropy label (base64 payload)',
            action: 'QUARANTINED',
            actionClass: 'act-block',
            rowClass: 'row-alert'
        },
        {
            proto: 'TLS',
            class: 'proto-https',
            src: '103.21.244.0:443',
            dst: '10.0.0.15:58210',
            event: 'Cloudflare Edge Certificate Verification Passed',
            action: 'VERIFIED',
            actionClass: 'act-pass',
            rowClass: 'row-normal'
        }
    ];

    let incidentCounter = 5;

    if (simAttackBtn && socFeedRows) {
        simAttackBtn.addEventListener('click', () => {
            soundFX.playClick();
            const inc = simulatedIncidents[Math.floor(Math.random() * simulatedIncidents.length)];
            const now = new Date().toTimeString().split(' ')[0];

            const newRow = document.createElement('div');
            newRow.className = `feed-row ${inc.rowClass}`;
            newRow.innerHTML = `
                <span>#0${incidentCounter++}</span>
                <span>${now}</span>
                <span>${inc.src}</span>
                <span>${inc.dst}</span>
                <span class="${inc.class}">${inc.proto}</span>
                <span>${inc.event}</span>
                <span class="${inc.actionClass}">${inc.action}</span>
            `;

            socFeedRows.insertBefore(newRow, socFeedRows.firstChild);
            if (socFeedRows.children.length > 8) {
                socFeedRows.removeChild(socFeedRows.lastChild);
            }
        });
    }

    if (clearLogBtn && socFeedRows) {
        clearLogBtn.addEventListener('click', () => {
            soundFX.playClick();
            socFeedRows.innerHTML = `
                <div class="feed-row row-normal">
                    <span>#01</span>
                    <span>${new Date().toTimeString().split(' ')[0]}</span>
                    <span>192.168.1.105:443</span>
                    <span>10.0.0.15:52194</span>
                    <span class="proto-tcp">TCP</span>
                    <span>BASELINE: Network connection established. Zero anomalous threats.</span>
                    <span class="act-pass">PASSED</span>
                </div>
            `;
            incidentCounter = 2;
        });
    }

    // ==========================================================================
    //  10. PORTFOLIO CONTACT FORM SUBMISSION & VALIDATION
    // ==========================================================================
    const contactForm = document.getElementById('portfolioContactForm');
    const contactSubmitBtn = document.getElementById('contactSubmitBtn');
    const btnSubmitTxt = document.getElementById('btnSubmitTxt');
    const formFeedback = document.getElementById('formFeedback');

    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    const phoneInput = document.getElementById('contactPhone');
    const subjectSelect = document.getElementById('contactSubject');
    const messageInput = document.getElementById('contactMessage');
    const hpInput = document.getElementById('website_hp');

    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const messageError = document.getElementById('messageError');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Reset errors
            if (nameError) nameError.textContent = '';
            if (emailError) emailError.textContent = '';
            if (messageError) messageError.textContent = '';
            if (formFeedback) {
                formFeedback.className = 'form-feedback-hud';
                formFeedback.innerHTML = '';
            }

            // Client Validation
            let hasError = false;
            const nameVal = (nameInput?.value || '').trim();
            const emailVal = (emailInput?.value || '').trim();
            const messageVal = (messageInput?.value || '').trim();

            if (!nameVal || nameVal.length < 2) {
                if (nameError) nameError.textContent = 'Please provide your name (min 2 characters).';
                hasError = true;
            }

            const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailVal || !emailRe.test(emailVal)) {
                if (emailError) emailError.textContent = 'Please enter a valid email address.';
                hasError = true;
            }

            if (!messageVal || messageVal.length < 10) {
                if (messageError) messageError.textContent = 'Please provide message details (min 10 characters).';
                hasError = true;
            }

            if (hasError) {
                soundFX.playClick();
                return;
            }

            // Disable button during transit
            if (contactSubmitBtn) contactSubmitBtn.disabled = true;
            if (btnSubmitTxt) btnSubmitTxt.textContent = 'TRANSMITTING DISPATCH...';

            try {
                const response = await fetch('/api/inquiries', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: nameVal,
                        email: emailVal,
                        phone: (phoneInput?.value || '').trim(),
                        subject: subjectSelect?.value || 'project',
                        message: messageVal,
                        website_hp: hpInput?.value || ''
                    })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    soundFX.playBloom();
                    contactForm.reset();
                    if (formFeedback) {
                        formFeedback.classList.add('hud-success');
                        formFeedback.innerHTML = `
                            <div class="feedback-icon">✓</div>
                            <div class="feedback-text">
                                <strong>DISPATCH TRANSMITTED TO ARYAN THAKAR</strong>
                                <span>Reference Code: <code>${data.inquiryRef}</code>. Persisted in SQLite. I will review and reply promptly!</span>
                            </div>
                        `;
                    }
                } else {
                    soundFX.playClick();
                    if (formFeedback) {
                        formFeedback.classList.add('hud-error');
                        formFeedback.innerHTML = `
                            <div class="feedback-icon">⚠</div>
                            <div class="feedback-text">
                                <strong>DISPATCH FAILED</strong>
                                <span>${data.error?.message || 'Server error occurred. Please reach out directly to aryanthakar3@gmail.com.'}</span>
                            </div>
                        `;
                    }
                }
            } catch (err) {
                if (formFeedback) {
                    formFeedback.classList.add('hud-error');
                    formFeedback.innerHTML = `
                        <div class="feedback-icon">⚠</div>
                        <div class="feedback-text">
                            <strong>NETWORK ERROR</strong>
                            <span>Unable to reach server. Please email directly: aryanthakar3@gmail.com</span>
                        </div>
                    `;
                }
            } finally {
                if (contactSubmitBtn) contactSubmitBtn.disabled = false;
                if (btnSubmitTxt) btnSubmitTxt.textContent = 'TRANSMIT DISPATCH';
            }
        });
    }

    // ==========================================================================
    //  11. SECURE ADMIN MANAGEMENT PORTAL
    // ==========================================================================
    const adminModal = document.getElementById('adminModal');
    const openAdminBtn = document.getElementById('openAdminBtn');
    const footerAdminTrigger = document.getElementById('footerAdminTrigger');
    const adminModalClose = document.getElementById('adminModalClose');
    const adminModalBackdrop = document.getElementById('adminModalBackdrop');

    const adminAuthBadge = document.getElementById('adminAuthBadge');
    const adminLoginView = document.getElementById('adminLoginView');
    const adminDashboardView = document.getElementById('adminDashboardView');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminKeyInput = document.getElementById('adminKeyInput');
    const adminLoginFeedback = document.getElementById('adminLoginFeedback');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');

    let adminSessionKey = sessionStorage.getItem('AT_ADMIN_TOKEN') || '';

    function checkAdminState() {
        if (adminSessionKey) {
            if (adminAuthBadge) {
                adminAuthBadge.textContent = 'AUTHORIZED: SUPER ADMIN';
                adminAuthBadge.classList.add('badge-authorized');
            }
            if (adminLoginView) adminLoginView.style.display = 'none';
            if (adminDashboardView) adminDashboardView.style.display = 'block';
            loadAdminData();
        } else {
            if (adminAuthBadge) {
                adminAuthBadge.textContent = 'LOCKED';
                adminAuthBadge.classList.remove('badge-authorized');
            }
            if (adminLoginView) adminLoginView.style.display = 'block';
            if (adminDashboardView) adminDashboardView.style.display = 'none';
        }
    }

    function openAdminModal() {
        soundFX.playClick();
        if (adminModal) {
            adminModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            checkAdminState();
        }
    }

    function closeAdminModal() {
        if (adminModal) {
            adminModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    if (openAdminBtn) openAdminBtn.addEventListener('click', openAdminModal);
    if (footerAdminTrigger) footerAdminTrigger.addEventListener('click', openAdminModal);
    if (adminModalClose) adminModalClose.addEventListener('click', closeAdminModal);
    if (adminModalBackdrop) adminModalBackdrop.addEventListener('click', closeAdminModal);

    // Admin Login Submission
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const keyVal = (adminKeyInput?.value || '').trim();
            if (!keyVal) return;

            try {
                const res = await fetch('/api/admin/auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: keyVal })
                });

                const data = await res.json();
                if (res.ok && data.success) {
                    soundFX.playBloom();
                    adminSessionKey = data.token;
                    sessionStorage.setItem('AT_ADMIN_TOKEN', data.token);
                    if (adminLoginFeedback) adminLoginFeedback.textContent = '';
                    checkAdminState();
                } else {
                    soundFX.playClick();
                    if (adminLoginFeedback) {
                        adminLoginFeedback.textContent = data.error?.message || 'Invalid administrator secret key.';
                    }
                }
            } catch (err) {
                if (adminLoginFeedback) adminLoginFeedback.textContent = 'Authentication network failure.';
            }
        });
    }

    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', () => {
            soundFX.playClick();
            adminSessionKey = '';
            sessionStorage.removeItem('AT_ADMIN_TOKEN');
            checkAdminState();
        });
    }

    // Admin Tabs Switcher
    const adminTabBtns = document.querySelectorAll('.admin-tab-btn:not(.admin-logout)');
    const adminTabContents = document.querySelectorAll('.admin-tab-content');

    adminTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            soundFX.playClick();
            adminTabBtns.forEach(b => b.classList.remove('active'));
            adminTabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const target = btn.getAttribute('data-tab');
            const targetContent = document.getElementById(target === 'inquiries' ? 'tabInquiries' : (target === 'projects' ? 'tabProjects' : 'tabStats'));
            if (targetContent) targetContent.classList.add('active');
        });
    });

    // Load Admin Data (Inquiries, Projects, Stats)
    async function loadAdminData() {
        if (!adminSessionKey) return;

        // 1. Inquiries
        try {
            const inqRes = await fetch('/api/inquiries', {
                headers: { 'Authorization': `Bearer ${adminSessionKey}` }
            });
            const inqData = await inqRes.json();
            const tbody = document.getElementById('inquiriesTableBody');
            const countEl = document.getElementById('adminInqCount');

            if (inqRes.ok && inqData.success && tbody) {
                if (countEl) countEl.textContent = inqData.count;
                if (inqData.data.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="7" class="text-center">No contact inquiries yet.</td></tr>';
                } else {
                    tbody.innerHTML = inqData.data.map(inq => `
                        <tr>
                            <td><code>${inq.inquiry_ref}</code></td>
                            <td><strong>${escapeHtml(inq.name)}</strong><br><small>${escapeHtml(inq.email)} ${inq.phone ? '&bull; ' + escapeHtml(inq.phone) : ''}</small></td>
                            <td><span class="badge-subject">${escapeHtml(inq.subject)}</span></td>
                            <td class="msg-cell" title="${escapeHtml(inq.message)}">${escapeHtml(inq.message)}</td>
                            <td><small>${new Date(inq.created_at).toLocaleString()}</small></td>
                            <td><span class="badge-status status-${inq.status.toLowerCase()}">${inq.status}</span></td>
                            <td>
                                <select class="status-change-select" data-id="${inq.id}">
                                    <option value="NEW" ${inq.status === 'NEW' ? 'selected' : ''}>NEW</option>
                                    <option value="REVIEWED" ${inq.status === 'REVIEWED' ? 'selected' : ''}>REVIEWED</option>
                                    <option value="REPLIED" ${inq.status === 'REPLIED' ? 'selected' : ''}>REPLIED</option>
                                    <option value="ARCHIVED" ${inq.status === 'ARCHIVED' ? 'selected' : ''}>ARCHIVED</option>
                                </select>
                            </td>
                        </tr>
                    `).join('');

                    // Wire status change dropdowns
                    tbody.querySelectorAll('.status-change-select').forEach(sel => {
                        sel.addEventListener('change', async (e) => {
                            const inqId = e.target.getAttribute('data-id');
                            const newStatus = e.target.value;
                            await fetch(`/api/admin/inquiries/${inqId}`, {
                                method: 'PATCH',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${adminSessionKey}`
                                },
                                body: JSON.stringify({ status: newStatus })
                            });
                            loadAdminData();
                        });
                    });
                }
            }
        } catch (e) {
            console.error('Failed to load admin inquiries:', e);
        }

        // 2. Admin Projects List
        try {
            const projRes = await fetch('/api/projects');
            const projData = await projRes.json();
            const projTbody = document.getElementById('adminProjectsTableBody');
            const projCountEl = document.getElementById('adminProjCount');

            if (projRes.ok && projData.success && projTbody) {
                if (projCountEl) projCountEl.textContent = projData.count;
                projTbody.innerHTML = projData.data.map(p => `
                    <tr>
                        <td><code>${p.id}</code></td>
                        <td><strong>${escapeHtml(p.title)}</strong></td>
                        <td><span class="badge-cat">${p.category}</span></td>
                        <td><span class="badge-flag">${p.badge || '-'}</span></td>
                        <td>${p.views_count} views</td>
                        <td>
                            <button class="btn btn-xs btn-outline open-case-study" data-slug="${p.slug}">VIEW</button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (e) {
            console.error('Failed to load admin projects:', e);
        }

        // 3. Telemetry Stats
        try {
            const statsRes = await fetch('/api/admin/stats', {
                headers: { 'Authorization': `Bearer ${adminSessionKey}` }
            });
            const statsData = await statsRes.json();
            if (statsRes.ok && statsData.success && statsData.data) {
                const s = statsData.data;
                const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
                setEl('statInquiriesTotal', s.inquiries.total);
                setEl('statInquiriesNew', s.inquiries.new);
                setEl('statProjectsTotal', s.projects);
                setEl('statProjectViews', s.projectViews);
                setEl('statUptime', `${Math.floor(s.system.uptimeSeconds / 60)} min`);
                setEl('statMemory', `${s.system.memoryUsageMB} MB`);
            }
        } catch (e) {
            console.error('Failed to load admin stats:', e);
        }
    }

    const refreshInquiriesBtn = document.getElementById('refreshInquiriesBtn');
    if (refreshInquiriesBtn) {
        refreshInquiriesBtn.addEventListener('click', () => {
            soundFX.playClick();
            loadAdminData();
        });
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>"']/g, (m) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[m]);
    }

    // ==========================================================================
    //  12. GLOBAL KEYBOARD SHORTCUTS
    // ==========================================================================
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeProjectModal();
            closeSaffronLabModal();
            closeResume();
            closeAdminModal();
        }
    });

});
