/* ==========================================================================
   SHREEJI SAFFRON — MASTER INTERACTION CONTROLLER
   Audio Synthesizer | Magnetic Cursor | 3D Vault Sync | Cart & Telemetry Engine
   ========================================================================== */

window.lerp = (a, b, t) => a + (b - a) * t;
window.clamp = (val, min, max) => Math.max(min, Math.min(max, val));

document.addEventListener('DOMContentLoaded', () => {

    const lerp = window.lerp;
    const clamp = window.clamp;

    // ==========================================================================
    //  01. WEB AUDIO API SYNTHESIZER (ZERO EXTERNAL ASSETS NEEDED)
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
                osc.frequency.setValueAtTime(800, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.05);

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

                gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
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
                osc.frequency.linearRampToValueAtTime(660, audioCtx.currentTime + 0.4);

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
                ambientGain.gain.setValueAtTime(0.04, audioCtx.currentTime);

                // Celestial drone chord (A2 110Hz + E3 165Hz)
                osc1 = audioCtx.createOscillator();
                osc2 = audioCtx.createOscillator();

                osc1.type = 'sine';
                osc1.frequency.setValueAtTime(110, audioCtx.currentTime);

                osc2.type = 'triangle';
                osc2.frequency.setValueAtTime(164.81, audioCtx.currentTime);

                const filter = audioCtx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(350, audioCtx.currentTime);

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

    // Audio HUD Toggle Button
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
    //  02. SCI-FI MAGNETIC CURSOR
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
            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top = mouseY + 'px';
        }
    }, { passive: true });

    function renderCursor() {
        ringX = lerp(ringX, mouseX, 0.15);
        ringY = lerp(ringY, mouseY, 0.15);

        if (cursorRing) {
            cursorRing.style.left = ringX + 'px';
            cursorRing.style.top = ringY + 'px';
        }
        requestAnimationFrame(renderCursor);
    }
    renderCursor();

    const interactiveSelectors = 'a, button, .product-card, .recipe-card, .benefit-card, .ticker-chip, input, select, textarea';
    document.querySelectorAll(interactiveSelectors).forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (cursorRing) cursorRing.classList.add('cursor-hover');
        });
        el.addEventListener('mouseleave', () => {
            if (cursorRing) cursorRing.classList.remove('cursor-hover');
        });
        el.addEventListener('click', () => {
            soundFX.playClick();
        });
    });

    // ==========================================================================
    //  03. SPLASH SCREEN DISSOLVE
    // ==========================================================================
    const splashScreen = document.getElementById('splashScreen');
    if (splashScreen) {
        setTimeout(() => {
            splashScreen.classList.add('hidden');
        }, 1800);
    }

    // ==========================================================================
    //  04. STICKY NAVBAR & MOBILE MENU
    // ==========================================================================
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // ==========================================================================
    //  05. 3D PRODUCT VAULT & TELEMETRY SYNCHRONIZATION
    // ==========================================================================
    const productCards = document.querySelectorAll('.product-card');
    const telemetryData = {
        mogra: {
            name: 'Mogra Grade I Saffron',
            crocin: '264.8 / 200 min',
            crocinWidth: '95%',
            safranal: '46.2 / 20-50 std',
            safranalWidth: '88%',
            picro: '89.4 / 70 min',
            picroWidth: '92%',
            tag: 'CATEGORY I PASS'
        },
        lachha: {
            name: 'Lachha Grade II Saffron',
            crocin: '224.5 / 170 min',
            crocinWidth: '82%',
            safranal: '41.0 / 20-50 std',
            safranalWidth: '78%',
            picro: '82.1 / 70 min',
            picroWidth: '85%',
            tag: 'CATEGORY II PASS'
        },
        zarda: {
            name: 'Zarda Fine Saffron',
            crocin: '188.2 / 140 min',
            crocinWidth: '70%',
            safranal: '36.5 / 20-50 std',
            safranalWidth: '68%',
            picro: '74.0 / 60 min',
            picroWidth: '76%',
            tag: 'CATEGORY III PASS'
        }
    };

    function updateVaultTelemetry(grade) {
        const data = telemetryData[grade];
        if (!data) return;

        const crocinVal = document.getElementById('metricCrocin');
        const crocinBar = document.getElementById('barCrocin');
        const safranalVal = document.getElementById('metricSafranal');
        const safranalBar = document.getElementById('barSafranal');
        const picroVal = document.getElementById('metricPicro');
        const picroBar = document.getElementById('barPicro');
        const purityTag = document.getElementById('telemetryPurityTag');

        if (crocinVal) crocinVal.textContent = data.crocin;
        if (crocinBar) crocinBar.style.width = data.crocinWidth;
        if (safranalVal) safranalVal.textContent = data.safranal;
        if (safranalBar) safranalBar.style.width = data.safranalWidth;
        if (picroVal) picroVal.textContent = data.picro;
        if (picroBar) picroBar.style.width = data.picroWidth;
        if (purityTag) purityTag.textContent = data.tag;

        // Dispatch to Three.js Vault Canvas
        window.dispatchEvent(new CustomEvent('vaultGradeChange', { detail: { grade } }));
    }

    productCards.forEach(card => {
        card.addEventListener('click', () => {
            productCards.forEach(c => c.classList.remove('active-vault-card'));
            card.classList.add('active-vault-card');
            const grade = card.dataset.product;
            updateVaultTelemetry(grade);
        });
    });

    // Molecular compound chips click interaction
    document.querySelectorAll('.ticker-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.ticker-chip').forEach(c => c.classList.remove('active-chip'));
            chip.classList.add('active-chip');
        });
    });

    // ==========================================================================
    //  06. WEIGHT TOGGLE & PRICING DYNAMICS
    // ==========================================================================
    document.querySelectorAll('.weight-toggle').forEach(toggle => {
        const buttons = toggle.querySelectorAll('.weight-btn');
        const card = toggle.closest('.product-card');
        const priceMap = JSON.parse(toggle.dataset.prices);
        const mrpMap = JSON.parse(toggle.dataset.mrps);
        const currentPriceEl = card.querySelector('.current-price');
        const priceWeightEl = card.querySelector('.price-weight');
        const mrpPriceEl = card.querySelector('.mrp-price');
        const addToCartBtn = card.querySelector('.add-to-cart-btn');

        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const weight = btn.dataset.weight;
                const price = priceMap[weight];
                const mrp = mrpMap[weight];

                currentPriceEl.style.transform = 'scale(0.85)';
                currentPriceEl.style.opacity = '0.5';

                setTimeout(() => {
                    currentPriceEl.textContent = '₹' + price;
                    priceWeightEl.textContent = '/ ' + weight + (weight === '1' ? ' gram' : ' grams');
                    mrpPriceEl.textContent = '₹' + mrp;
                    addToCartBtn.dataset.price = price;
                    currentPriceEl.style.transform = 'scale(1)';
                    currentPriceEl.style.opacity = '1';
                }, 140);
            });
        });
    });

    // Quantity Selectors
    document.querySelectorAll('.quantity-selector').forEach(selector => {
        const minusBtn = selector.querySelector('.qty-minus');
        const plusBtn = selector.querySelector('.qty-plus');
        const valueEl = selector.querySelector('.qty-value');

        minusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            let val = parseInt(valueEl.textContent);
            if (val > 1) valueEl.textContent = val - 1;
        });

        plusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            let val = parseInt(valueEl.textContent);
            if (val < 10) valueEl.textContent = val + 1;
        });
    });

    // ==========================================================================
    //  07. FULLY FUNCTIONAL CART DRAWER & NOTIFICATIONS
    // ==========================================================================
    const cartBtn = document.getElementById('cartBtn');
    const cartCount = document.getElementById('cartCount');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartCloseBtn = document.getElementById('cartCloseBtn');
    const cartItemsEl = document.getElementById('cartItems');
    const cartEmptyEl = document.getElementById('cartEmpty');
    const cartDrawerFooter = document.getElementById('cartDrawerFooter');
    const cartTotalAmount = document.getElementById('cartTotalAmount');
    const cartShopBtn = document.getElementById('cartShopBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const toastContainer = document.getElementById('toastContainer');

    // Checkout Modal Elements
    const checkoutModal = document.getElementById('checkoutModal');
    const checkoutOverlay = document.getElementById('checkoutOverlay');
    const checkoutCloseBtn = document.getElementById('checkoutCloseBtn');
    const checkoutForm = document.getElementById('checkoutForm');
    const modalSubtotal = document.getElementById('modalSubtotal');
    const modalShipping = document.getElementById('modalShipping');
    const modalTotal = document.getElementById('modalTotal');
    const confirmOrderBtn = document.getElementById('confirmOrderBtn');

    // Receipt Modal Elements
    const receiptModal = document.getElementById('receiptModal');
    const receiptOverlay = document.getElementById('receiptOverlay');
    const receiptCloseBtn = document.getElementById('receiptCloseBtn');
    const receiptRefCode = document.getElementById('receiptRefCode');
    const receiptAmount = document.getElementById('receiptAmount');

    // Cart State with LocalStorage Persistence
    let cart = [];
    try {
        const saved = localStorage.getItem('shreeji_cart_v1');
        if (saved) {
            cart = JSON.parse(saved);
        }
    } catch (e) {
        cart = [];
    }

    function saveCart() {
        try {
            localStorage.setItem('shreeji_cart_v1', JSON.stringify(cart));
        } catch (e) {}
    }

    function openCart() {
        cartDrawer.classList.add('open');
        cartOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        renderCart();
    }

    function closeCart() {
        cartDrawer.classList.remove('open');
        cartOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    function openCheckoutModal() {
        if (cart.length === 0) {
            showToast('Your allocation vault is empty. Please select a specimen.');
            return;
        }

        const subtotal = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
        const shippingFee = subtotal >= 999 ? 0 : 99;
        const total = subtotal + shippingFee;

        if (modalSubtotal) modalSubtotal.textContent = '₹' + subtotal.toLocaleString('en-IN');
        if (modalShipping) {
            modalShipping.textContent = shippingFee === 0 ? 'COMPLIMENTARY' : '₹99';
            modalShipping.className = shippingFee === 0 ? 'free-courier' : '';
        }
        if (modalTotal) modalTotal.textContent = '₹' + total.toLocaleString('en-IN');

        closeCart();
        if (checkoutModal) checkoutModal.classList.add('open');
        if (checkoutOverlay) checkoutOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeCheckoutModal() {
        if (checkoutModal) checkoutModal.classList.remove('open');
        if (checkoutOverlay) checkoutOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    function openReceiptModal(orderRef, total) {
        if (receiptRefCode) receiptRefCode.textContent = orderRef;
        if (receiptAmount) receiptAmount.textContent = '₹' + Number(total).toLocaleString('en-IN');

        if (receiptModal) receiptModal.classList.add('open');
        if (receiptOverlay) receiptOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeReceiptModal() {
        if (receiptModal) receiptModal.classList.remove('open');
        if (receiptOverlay) receiptOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    if (cartBtn) cartBtn.addEventListener('click', openCart);
    if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
    if (cartShopBtn) cartShopBtn.addEventListener('click', closeCart);

    if (checkoutBtn) checkoutBtn.addEventListener('click', openCheckoutModal);
    if (checkoutCloseBtn) checkoutCloseBtn.addEventListener('click', closeCheckoutModal);
    if (checkoutOverlay) checkoutOverlay.addEventListener('click', closeCheckoutModal);

    if (receiptCloseBtn) receiptCloseBtn.addEventListener('click', closeReceiptModal);
    if (receiptOverlay) receiptOverlay.addEventListener('click', closeReceiptModal);

    function renderCart() {
        if (cart.length === 0) {
            cartEmptyEl.style.display = 'block';
            cartItemsEl.innerHTML = '';
            cartDrawerFooter.style.display = 'none';
        } else {
            cartEmptyEl.style.display = 'none';
            cartDrawerFooter.style.display = 'block';
            cartItemsEl.innerHTML = cart.map((item, index) => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name} (${item.weight})</div>
                        <div class="cart-item-details">Qty: ${item.qty} × ₹${item.price}</div>
                    </div>
                    <div class="cart-item-price">₹${(item.qty * item.price).toLocaleString('en-IN')}</div>
                    <button class="cart-item-remove" data-index="${index}" aria-label="Remove item">✕</button>
                </div>
            `).join('');

            const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
            cartTotalAmount.textContent = '₹' + total.toLocaleString('en-IN');

            cartItemsEl.querySelectorAll('.cart-item-remove').forEach(btn => {
                btn.addEventListener('click', () => {
                    const idx = parseInt(btn.dataset.index, 10);
                    cart.splice(idx, 1);
                    saveCart();
                    updateCartCount();
                    renderCart();
                    showToast('Allocation removed');
                });
            });
        }
    }

    function updateCartCount() {
        const total = cart.reduce((sum, item) => sum + item.qty, 0);
        if (cartCount) cartCount.textContent = total;
    }

    // Initialize cart count on boot
    updateCartCount();

    // Add To Cart Handlers
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.product-card');
            const name = btn.dataset.name;
            const price = parseInt(btn.dataset.price, 10);
            const qty = parseInt(card.querySelector('.qty-value').textContent, 10);
            const weight = card.querySelector('.weight-btn.active').textContent;

            const existing = cart.find(item => item.name === name && item.weight === weight);
            if (existing) {
                existing.qty += qty;
            } else {
                cart.push({ name, price, qty, weight });
            }

            saveCart();
            updateCartCount();
            soundFX.playClick();

            // Button feedback
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<span>✓ ALLOCATED</span>';
            btn.style.borderColor = '#00f5d4';
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.borderColor = '';
            }, 1200);

            showToast(`${name} (${weight} × ${qty}) secured in Vault!`);
        });
    });

    // Checkout Form Order Submission (ACID Transaction via /api/orders)
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (cart.length === 0) {
                showToast('Your allocation cart is empty.');
                closeCheckoutModal();
                return;
            }

            const name = document.getElementById('checkoutName').value.trim();
            const email = document.getElementById('checkoutEmail').value.trim();
            const phone = document.getElementById('checkoutPhone').value.trim();
            const address = document.getElementById('checkoutAddress').value.trim();
            const city = document.getElementById('checkoutCity').value.trim();
            const postal = document.getElementById('checkoutPostal').value.trim();

            if (!name || !email || !phone || !address || !city || !postal) {
                showToast('Please fill in all mandatory dispatch fields.');
                return;
            }

            const originalBtnHTML = confirmOrderBtn ? confirmOrderBtn.innerHTML : '';
            if (confirmOrderBtn) {
                confirmOrderBtn.disabled = true;
                confirmOrderBtn.innerHTML = '<span>TRANSMITTING DISPATCH...</span>';
            }

            try {
                const payload = {
                    customer_name: name,
                    customer_email: email,
                    customer_phone: phone,
                    shipping_address: address,
                    city,
                    postal_code: postal,
                    country: 'India',
                    items: cart.map(item => ({
                        name: item.name,
                        weight: item.weight,
                        qty: item.qty
                    }))
                };

                const res = await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();

                if (!res.ok || !data.success) {
                    throw new Error(data.error?.message || 'Order transmission failed.');
                }

                // Success! Clear cart, close checkout, open receipt
                cart = [];
                saveCart();
                updateCartCount();
                renderCart();
                checkoutForm.reset();
                closeCheckoutModal();

                openReceiptModal(data.orderRef, data.orderSummary.totalAmount);
                if (soundFX && soundFX.playBloom) soundFX.playBloom();
                showToast(`Allocation confirmed! Reference: ${data.orderRef}`);

            } catch (err) {
                console.error('[Checkout Error]:', err);
                showToast(err.message || 'Network error transmitting allocation.');
            } finally {
                if (confirmOrderBtn) {
                    confirmOrderBtn.disabled = false;
                    confirmOrderBtn.innerHTML = originalBtnHTML;
                }
            }
        });
    }

    function showToast(message) {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = 'toast toast-success';
        toast.innerHTML = `<span class="toast-spark">✦</span><span>${message}</span>`;
        toastContainer.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('show'));

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3600);
    }

    // ==========================================================================
    //  08. ANIMATED NUMBER COUNTERS & TELEMETRY
    // ==========================================================================
    const counterElements = document.querySelectorAll('.stat-number[data-target]');
    let countersDone = false;

    function animateCounters() {
        if (countersDone) return;
        countersDone = true;
        counterElements.forEach(el => {
            const target = parseInt(el.dataset.target, 10);
            const suffix = el.dataset.suffix || '';
            const duration = 2200;
            const start = performance.now();

            function tick(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(eased * target);
                el.textContent = current.toLocaleString('en-IN') + suffix;
                if (progress < 1) {
                    requestAnimationFrame(tick);
                } else {
                    el.textContent = target.toLocaleString('en-IN') + suffix;
                }
            }
            requestAnimationFrame(tick);
        });
    }

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        const counterObs = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                animateCounters();
                counterObs.disconnect();
            }
        }, { threshold: 0.3 });
        counterObs.observe(heroStats);
    }

    // Live Server Telemetry Syncer
    async function fetchTelemetry() {
        try {
            const res = await fetch('/api/telemetry');
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.telemetry) {
                    // Update live metrics if elements exist
                    const teleEl = document.getElementById('telemetryPurityTag');
                    if (teleEl && data.telemetry.isoStandard) {
                        teleEl.textContent = data.telemetry.isoStandard.toUpperCase() + ' PASS';
                    }
                }
            }
        } catch (e) {
            // Non-blocking telemetry fallback
        }
    }
    fetchTelemetry();

    // ==========================================================================
    //  09. TESTIMONIALS CAROUSEL
    // ==========================================================================
    const carouselTrack = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    const dotsContainer = document.getElementById('carouselDots');
    const testimonialCards = carouselTrack ? carouselTrack.querySelectorAll('.testimonial-card') : [];
    let currentSlide = 0;
    let autoSlideInterval;

    if (testimonialCards.length > 0 && dotsContainer) {
        testimonialCards.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        });

        function goToSlide(idx) {
            currentSlide = idx;
            carouselTrack.style.transform = `translateX(-${idx * 100}%)`;
            dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) => {
                d.classList.toggle('active', i === idx);
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                goToSlide(currentSlide === 0 ? testimonialCards.length - 1 : currentSlide - 1);
                resetAutoSlide();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                goToSlide(currentSlide === testimonialCards.length - 1 ? 0 : currentSlide + 1);
                resetAutoSlide();
            });
        }

        function startAutoSlide() {
            autoSlideInterval = setInterval(() => {
                goToSlide((currentSlide + 1) % testimonialCards.length);
            }, 6000);
        }

        function resetAutoSlide() {
            clearInterval(autoSlideInterval);
            startAutoSlide();
        }

        startAutoSlide();
    }

    // ==========================================================================
    //  10. CONTACT & NEWSLETTER FORMS (REAL DATABASE PERSISTENCE)
    // ==========================================================================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('submitBtn');
            const originalHTML = submitBtn ? submitBtn.innerHTML : '';

            const formData = new FormData(contactForm);
            const payload = {
                name: (formData.get('name') || '').trim(),
                email: (formData.get('email') || '').trim(),
                phone: (formData.get('phone') || '').trim(),
                subject: formData.get('subject') || 'other',
                message: (formData.get('message') || '').trim(),
                website_hp: formData.get('website_hp') || ''
            };

            if (submitBtn) {
                submitBtn.innerHTML = '<span>TRANSMITTING DISPATCH...</span>';
                submitBtn.disabled = true;
            }

            try {
                const res = await fetch('/api/inquiries', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();

                if (!res.ok || !data.success) {
                    throw new Error(data.error?.message || 'Transmission failed. Please check your details.');
                }

                if (submitBtn) {
                    submitBtn.innerHTML = '<span>✓ DISPATCH LOGGED</span>';
                    submitBtn.style.background = 'linear-gradient(135deg, #00f5d4, #00bbf9)';
                }

                showToast(data.message || `Concierge dispatch logged. Ref: ${data.inquiryRef}`);
                contactForm.reset();

                setTimeout(() => {
                    if (submitBtn) {
                        submitBtn.innerHTML = originalHTML;
                        submitBtn.style.background = '';
                        submitBtn.disabled = false;
                    }
                }, 4000);

            } catch (err) {
                console.error('[Contact Form Error]:', err);
                showToast(err.message || 'Failed to transmit message.');
                if (submitBtn) {
                    submitBtn.innerHTML = originalHTML;
                    submitBtn.disabled = false;
                }
            }
        });
    }

    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            const email = emailInput ? emailInput.value.trim() : '';

            if (!email) {
                showToast('Please enter your email address.');
                return;
            }

            try {
                const res = await fetch('/api/newsletter', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                const data = await res.json();

                if (!res.ok || !data.success) {
                    throw new Error(data.error?.message || 'Failed to register subscription.');
                }

                showToast(data.message || 'Confidential Guild registration confirmed ✦');
                newsletterForm.reset();

            } catch (err) {
                console.error('[Newsletter Error]:', err);
                showToast(err.message || 'Subscription failed.');
            }
        });
    }

    // ==========================================================================
    //  11. LIGHTBOX SPECIMEN PREVIEW
    // ==========================================================================
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');

    function openLightbox(src) {
        if (!lightbox || !lightboxImg) return;
        lightboxImg.src = src;
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    document.querySelectorAll('.quick-view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.product-card');
            const img = card.querySelector('.product-image');
            if (img) openLightbox(img.src);
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLightbox();
            closeCart();
            closeCheckoutModal();
            closeReceiptModal();
        }
    });

    // ==========================================================================
    //  12. STICKY ADD TO CART BAR
    // ==========================================================================
    const stickyCartBar = document.getElementById('stickyCartBar');
    const stickyProductName = document.getElementById('stickyProductName');
    const stickyProductPrice = document.getElementById('stickyProductPrice');
    const stickyAddBtn = document.getElementById('stickyAddBtn');
    const productsSection = document.getElementById('products');
    let currentSelectedCard = productCards[0];

    window.addEventListener('scroll', () => {
        if (!productsSection || !stickyCartBar) return;
        const rect = productsSection.getBoundingClientRect();
        if (rect.bottom < 0 && window.scrollY > 800) {
            stickyCartBar.classList.add('visible');
        } else {
            stickyCartBar.classList.remove('visible');
        }
    }, { passive: true });

    if (stickyAddBtn) {
        stickyAddBtn.addEventListener('click', () => {
            if (currentSelectedCard) {
                const addBtn = currentSelectedCard.querySelector('.add-to-cart-btn');
                if (addBtn) addBtn.click();
            }
        });
    }

    // Scroll reveal observer
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => revealObserver.observe(el));

    // Nav active link indicator
    const sections = document.querySelectorAll('section[id]');
    const navObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, { threshold: 0.25 });

    sections.forEach(s => navObs.observe(s));

});
