/* =============================================
   SHREEJI SAFFRON AGENCY – Premium Irani Saffron
   Interactive Scripts
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

    // ---------- ELEMENTS ----------
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const cartCount = document.getElementById('cartCount');
    const toastContainer = document.getElementById('toastContainer');
    const heroParticles = document.getElementById('heroParticles');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartCloseBtn = document.getElementById('cartCloseBtn');
    const cartDrawerBody = document.getElementById('cartDrawerBody');
    const cartItemsEl = document.getElementById('cartItems');
    const cartEmptyEl = document.getElementById('cartEmpty');
    const cartDrawerFooter = document.getElementById('cartDrawerFooter');
    const cartTotalAmount = document.getElementById('cartTotalAmount');
    const cartShopBtn = document.getElementById('cartShopBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');

    let cart = [];

    // ---------- CART DRAWER ----------
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

    document.getElementById('cartBtn').addEventListener('click', openCart);
    cartCloseBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);
    if (cartShopBtn) {
        cartShopBtn.addEventListener('click', closeCart);
    }
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            showToast('Checkout functionality coming soon!');
        });
    }

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
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-details">Qty: ${item.qty} × ₹${item.price}</div>
                    </div>
                    <div class="cart-item-price">₹${item.qty * item.price}</div>
                    <button class="cart-item-remove" data-index="${index}" aria-label="Remove item">✕</button>
                </div>
            `).join('');
            // Total
            const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
            cartTotalAmount.textContent = '₹' + total.toLocaleString('en-IN');
            // Wire remove buttons
            cartItemsEl.querySelectorAll('.cart-item-remove').forEach(btn => {
                btn.addEventListener('click', () => {
                    const idx = parseInt(btn.dataset.index);
                    cart.splice(idx, 1);
                    updateCartCount();
                    renderCart();
                    showToast('Item removed from cart');
                });
            });
        }
    }

    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
        cartCount.textContent = totalItems;
        if (totalItems > 0) {
            cartCount.classList.add('show');
        } else {
            cartCount.classList.remove('show');
        }
    }

    // ---------- STICKY NAVBAR ----------
    const handleScroll = () => {
        if (window.scrollY > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // ---------- HAMBURGER MENU ----------
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

    // ---------- SMOOTH SCROLL ----------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ---------- SCROLL ANIMATIONS (Intersection Observer) ----------
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger animation for grid items
                const siblings = entry.target.parentElement.querySelectorAll('.animate-on-scroll');
                let delay = 0;
                if (siblings.length > 1) {
                    const siblingIndex = Array.from(siblings).indexOf(entry.target);
                    delay = siblingIndex * 100;
                }
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);
                scrollObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        scrollObserver.observe(el);
    });

    // ---------- HERO PARTICLES ----------
    function createParticles() {
        if (!heroParticles) return;
        for (let i = 0; i < 25; i++) {
            const particle = document.createElement('div');
            particle.classList.add('hero-particle');
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (4 + Math.random() * 4) + 's';
            particle.style.width = (2 + Math.random() * 4) + 'px';
            particle.style.height = particle.style.width;
            heroParticles.appendChild(particle);
        }
    }
    createParticles();

    // ---------- QUANTITY SELECTORS ----------
    document.querySelectorAll('.quantity-selector').forEach(selector => {
        const minusBtn = selector.querySelector('.qty-minus');
        const plusBtn = selector.querySelector('.qty-plus');
        const valueEl = selector.querySelector('.qty-value');

        minusBtn.addEventListener('click', () => {
            let val = parseInt(valueEl.textContent);
            if (val > 1) {
                valueEl.textContent = val - 1;
            }
        });

        plusBtn.addEventListener('click', () => {
            let val = parseInt(valueEl.textContent);
            if (val < 10) {
                valueEl.textContent = val + 1;
            }
        });
    });

    // ---------- ADD TO CART ----------
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.product-card');
            const name = btn.dataset.name;
            const price = parseInt(btn.dataset.price);
            const qty = parseInt(card.querySelector('.qty-value').textContent);

            // Add item to cart
            const existingItem = cart.find(item => item.name === name);
            if (existingItem) {
                existingItem.qty += qty;
            } else {
                cart.push({ name, price, qty });
            }

            // Update cart count
            updateCartCount();

            // Button feedback
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '✓ Added!';
            btn.classList.add('added');
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.classList.remove('added');
            }, 1500);

            // Show toast
            showToast(`${name} (×${qty}) added to cart!`);
        });
    });

    // ---------- TOAST NOTIFICATIONS ----------
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast toast-success';
        toast.innerHTML = `<span class="toast-icon">🛒</span><span>${message}</span>`;
        toastContainer.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    // ---------- TESTIMONIAL CAROUSEL ----------
    const carouselTrack = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    const dotsContainer = document.getElementById('carouselDots');
    const testimonialCards = carouselTrack ? carouselTrack.querySelectorAll('.testimonial-card') : [];
    let currentSlide = 0;
    let autoSlideInterval;

    function initCarousel() {
        if (testimonialCards.length === 0) return;

        // Create dots
        testimonialCards.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        });

        // Button listeners
        prevBtn.addEventListener('click', () => {
            goToSlide(currentSlide === 0 ? testimonialCards.length - 1 : currentSlide - 1);
            resetAutoSlide();
        });

        nextBtn.addEventListener('click', () => {
            goToSlide(currentSlide === testimonialCards.length - 1 ? 0 : currentSlide + 1);
            resetAutoSlide();
        });

        // Auto-slide
        startAutoSlide();
    }

    function goToSlide(index) {
        currentSlide = index;
        carouselTrack.style.transform = `translateX(-${index * 100}%)`;

        // Update dots
        dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    function startAutoSlide() {
        autoSlideInterval = setInterval(() => {
            goToSlide(currentSlide === testimonialCards.length - 1 ? 0 : currentSlide + 1);
        }, 5000);
    }

    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }

    initCarousel();

    // ---------- CONTACT FORM ----------
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('submitBtn');
            const originalHTML = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span>Sending...</span>';
            submitBtn.disabled = true;

            setTimeout(() => {
                submitBtn.innerHTML = '<span>✓ Message Sent!</span>';
                submitBtn.style.background = 'linear-gradient(135deg, #2d6a4f, #1b4332)';
                showToast('Thank you! We\'ll get back to you soon.');
                contactForm.reset();

                setTimeout(() => {
                    submitBtn.innerHTML = originalHTML;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                }, 3000);
            }, 1500);
        });
    }

    // ---------- NEWSLETTER FORM ----------
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('Welcome to the Shreeji Saffron family! 🎉');
            newsletterForm.reset();
        });
    }

    // ---------- ACTIVE NAV LINK HIGHLIGHT ----------
    const sections = document.querySelectorAll('section[id]');
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, { threshold: 0.3 });

    sections.forEach(section => navObserver.observe(section));

    // ---------- KEYBOARD NAV FOR CAROUSEL ----------
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevBtn?.click();
        } else if (e.key === 'ArrowRight') {
            nextBtn?.click();
        }
    });

    // =============================================
    //  PREMIUM ENHANCEMENTS
    // =============================================

    // ---------- SPLASH SCREEN ----------
    const splashScreen = document.getElementById('splashScreen');
    if (splashScreen) {
        setTimeout(() => {
            splashScreen.classList.add('hidden');
            setTimeout(() => splashScreen.remove(), 600);
        }, 2000);
    }

    // ---------- ANIMATED NUMBER COUNTERS ----------
    const counterElements = document.querySelectorAll('.stat-number[data-target]');
    let countersDone = false;

    function animateCounters() {
        if (countersDone) return;
        countersDone = true;
        counterElements.forEach(el => {
            const target = parseInt(el.dataset.target);
            const suffix = el.dataset.suffix || '';
            const duration = 2000;
            const start = performance.now();

            function tick(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(eased * target);
                el.textContent = current + suffix;
                if (progress < 1) {
                    requestAnimationFrame(tick);
                } else {
                    el.textContent = target + suffix;
                }
            }
            requestAnimationFrame(tick);
        });
    }

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                counterObserver.disconnect();
            }
        });
    }, { threshold: 0.5 });

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) counterObserver.observe(heroStats);

    // ---------- PARALLAX SCROLLING ----------
    const heroSection = document.querySelector('[data-parallax="hero"]');
    const storyImage = document.querySelector('.story-image img');

    function handleParallax() {
        const scrollY = window.scrollY;
        if (heroSection) {
            heroSection.style.backgroundPositionY = (scrollY * 0.4) + 'px';
        }
        if (storyImage) {
            const storyRect = storyImage.closest('.story').getBoundingClientRect();
            if (storyRect.top < window.innerHeight && storyRect.bottom > 0) {
                const offset = (storyRect.top / window.innerHeight) * 30;
                storyImage.style.transform = `translateY(${offset}px)`;
            }
        }
    }
    window.addEventListener('scroll', handleParallax, { passive: true });

    // ---------- GOLDEN CURSOR GLOW ----------
    if (heroSection) {
        const glow = document.createElement('div');
        glow.className = 'hero-cursor-glow';
        heroSection.appendChild(glow);

        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();
            glow.style.left = (e.clientX - rect.left) + 'px';
            glow.style.top = (e.clientY - rect.top) + 'px';
        });

        heroSection.addEventListener('mouseleave', () => {
            glow.style.opacity = '0';
        });

        heroSection.addEventListener('mouseenter', () => {
            glow.style.opacity = '1';
        });
    }

    // ---------- LIGHTBOX ----------
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');

    function openLightbox(src) {
        lightboxImg.src = src;
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightbox) lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // Quick View buttons open lightbox
    document.querySelectorAll('.quick-view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.product-card');
            const img = card.querySelector('.product-image');
            if (img) openLightbox(img.src);
        });
    });

    // Product images also open lightbox on click
    document.querySelectorAll('.product-image').forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => openLightbox(img.src));
    });

    // Escape to close lightbox
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLightbox();
            closeCart();
        }
    });

    // ---------- WEIGHT TOGGLE ----------
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
            btn.addEventListener('click', () => {
                // Update active state
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const weight = btn.dataset.weight;
                const price = priceMap[weight];
                const mrp = mrpMap[weight];

                // Animate price change
                currentPriceEl.style.transform = 'scale(0.8)';
                currentPriceEl.style.opacity = '0.5';
                setTimeout(() => {
                    currentPriceEl.textContent = '₹' + price;
                    priceWeightEl.textContent = '/ ' + weight + (weight === '1' ? ' gram' : ' grams');
                    mrpPriceEl.textContent = '₹' + mrp;
                    addToCartBtn.dataset.price = price;
                    currentPriceEl.style.transform = 'scale(1)';
                    currentPriceEl.style.opacity = '1';
                }, 150);
            });
        });
    });

    // ---------- STICKY ADD-TO-CART BAR ----------
    const stickyCartBar = document.getElementById('stickyCartBar');
    const stickyProductName = document.getElementById('stickyProductName');
    const stickyProductPrice = document.getElementById('stickyProductPrice');
    const stickyAddBtn = document.getElementById('stickyAddBtn');
    const productsSection = document.getElementById('products');
    let currentStickyProduct = null;

    function handleStickyBar() {
        if (!productsSection || !stickyCartBar) return;
        const rect = productsSection.getBoundingClientRect();
        // Show when products are scrolled past
        if (rect.bottom < 0 && window.scrollY > 600) {
            stickyCartBar.classList.add('visible');
        } else {
            stickyCartBar.classList.remove('visible');
        }
    }

    window.addEventListener('scroll', handleStickyBar, { passive: true });

    // Update sticky bar with the nearest visible product
    const productCards = document.querySelectorAll('.product-card');
    const productObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const card = entry.target;
                const name = card.querySelector('.product-name')?.textContent || 'Saffron';
                const price = card.querySelector('.current-price')?.textContent || '₹599';
                const weight = card.querySelector('.weight-btn.active')?.textContent || '1g';
                stickyProductName.textContent = name;
                stickyProductPrice.textContent = price + ' / ' + weight;
                currentStickyProduct = card;
            }
        });
    }, { threshold: 0.5 });

    productCards.forEach(card => productObserver.observe(card));

    if (stickyAddBtn) {
        stickyAddBtn.addEventListener('click', () => {
            if (currentStickyProduct) {
                const addBtn = currentStickyProduct.querySelector('.add-to-cart-btn');
                if (addBtn) addBtn.click();
            } else {
                // Default to first product
                const firstAddBtn = document.querySelector('.add-to-cart-btn');
                if (firstAddBtn) firstAddBtn.click();
            }
        });
    }

});
