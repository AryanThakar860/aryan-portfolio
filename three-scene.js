/* ==========================================================================
   SHREEJI SAFFRON — MASTERCLASS 3D ENGINE
   Kinetic Botanical Core | 3D Vault Capsule | Bio-Molecular Lattice | Kashmiri Mist
   ========================================================================== */

(function () {
    'use strict';

    // Global check for WebGL support
    function hasWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    if (!hasWebGL()) {
        console.warn('WebGL is not supported on this device. Fallback static backgrounds enabled.');
        document.body.classList.add('no-webgl');
        return;
    }

    // ---------- MATH & UTILITY HELPERS ----------
    const lerp = (a, b, t) => a + (b - a) * t;
    const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

    // Global mouse tracker
    const mouse = {
        x: 0, y: 0,
        nx: 0, ny: 0, // normalized [-1, 1]
        targetX: 0, targetY: 0,
        isDown: false,
        dragStartX: 0, dragStartY: 0,
        deltaX: 0, deltaY: 0
    };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.nx = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.ny = -(e.clientY / window.innerHeight) * 2 + 1;
    }, { passive: true });

    // IntersectionObserver to only render visible WebGL scenes (60FPS optimization)
    function createObserver(element, onEnter, onLeave) {
        if (!element) return { visible: false };
        let isVisible = false;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isVisible = entry.isIntersecting;
                if (isVisible && onEnter) onEnter();
                if (!isVisible && onLeave) onLeave();
            });
        }, { threshold: 0.05 });
        observer.observe(element);
        return { get visible() { return isVisible; } };
    }

    // Procedural Glowing Particle Canvas Texture
    function createGlowTexture(coreColor, edgeColor) {
        const size = 128;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        gradient.addColorStop(0, coreColor || 'rgba(255, 230, 160, 1)');
        gradient.addColorStop(0.25, 'rgba(245, 184, 46, 0.7)');
        gradient.addColorStop(0.6, edgeColor || 'rgba(255, 42, 95, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        return new THREE.CanvasTexture(canvas);
    }

    const sharedGlowTexture = createGlowTexture();

    // ==========================================================================
    //  SCENE 01: HERO — KINETIC SACRED BOTANICAL CORE
    // ==========================================================================
    function initHeroScene() {
        const canvas = document.getElementById('heroCanvas');
        if (!canvas) return;

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x030408, 0.015);

        const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 42);

        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);

        // Master 3D Artifact Group
        const artifactGroup = new THREE.Group();
        scene.add(artifactGroup);

        // 1. Gyroscopic Celestial Rings (Imperial Sacred Geometry)
        const ringGroup = new THREE.Group();
        artifactGroup.add(ringGroup);

        const ringMaterials = [
            new THREE.MeshStandardMaterial({
                color: 0xf5b82e,
                roughness: 0.2,
                metalness: 0.9,
                emissive: 0xf5b82e,
                emissiveIntensity: 0.15
            }),
            new THREE.MeshStandardMaterial({
                color: 0xffd166,
                roughness: 0.3,
                metalness: 0.85,
                emissive: 0xff2a5f,
                emissiveIntensity: 0.1
            }),
            new THREE.MeshStandardMaterial({
                color: 0x8a2be2,
                roughness: 0.25,
                metalness: 0.8,
                emissive: 0x8a2be2,
                emissiveIntensity: 0.2
            })
        ];

        const ringRadii = [11, 13.5, 16];
        const rings = [];

        ringRadii.forEach((r, idx) => {
            const ringGeom = new THREE.TorusGeometry(r, 0.08, 16, 120);
            const ringMesh = new THREE.Mesh(ringGeom, ringMaterials[idx]);
            ringMesh.rotation.x = Math.PI / (2 + idx * 0.4);
            ringMesh.rotation.y = idx * 0.7;
            ringGroup.add(ringMesh);

            // Add node markers on ring
            const markerCount = 8;
            for (let m = 0; m < markerCount; m++) {
                const angle = (m / markerCount) * Math.PI * 2;
                const markerGeom = new THREE.OctahedronGeometry(0.22);
                const markerMesh = new THREE.Mesh(markerGeom, ringMaterials[0]);
                markerMesh.position.set(Math.cos(angle) * r, Math.sin(angle) * r, 0);
                ringMesh.add(markerMesh);
            }

            rings.push({
                mesh: ringMesh,
                speedX: (idx % 2 === 0 ? 0.003 : -0.004) * (idx + 1),
                speedY: (idx % 2 === 0 ? 0.005 : -0.003) * (idx + 1)
            });
        });

        // 2. Blooming Kinetic Crocus Petals
        const flowerGroup = new THREE.Group();
        artifactGroup.add(flowerGroup);

        const petalColors = [0x6A1B9A, 0x8E24AA, 0x7B1FA2, 0x9C27B0, 0x6A1B9A, 0x8E24AA];
        const petals = [];
        const petalCount = 6;

        for (let i = 0; i < petalCount; i++) {
            const petalShape = new THREE.Shape();
            petalShape.moveTo(0, 0);
            petalShape.bezierCurveTo(0.8, 0.8, 1.4, 3.2, 0.2, 5.8);
            petalShape.bezierCurveTo(0, 6.4, 0, 6.4, -0.2, 5.8);
            petalShape.bezierCurveTo(-1.4, 3.2, -0.8, 0.8, 0, 0);

            const extrudeSettings = {
                depth: 0.08,
                bevelEnabled: true,
                bevelThickness: 0.04,
                bevelSize: 0.04,
                bevelSegments: 4
            };

            const petalGeom = new THREE.ExtrudeGeometry(petalShape, extrudeSettings);
            const petalMat = new THREE.MeshStandardMaterial({
                color: petalColors[i],
                roughness: 0.4,
                metalness: 0.35,
                emissive: petalColors[i],
                emissiveIntensity: 0.18,
                side: THREE.DoubleSide
            });

            const petalMesh = new THREE.Mesh(petalGeom, petalMat);
            const angle = (i / petalCount) * Math.PI * 2;

            const petalPivot = new THREE.Group();
            petalPivot.rotation.z = angle;
            petalPivot.add(petalMesh);

            petalMesh.position.y = 0.5;
            petalMesh.rotation.x = -0.45; // baseline tilt

            flowerGroup.add(petalPivot);
            petals.push({ pivot: petalPivot, mesh: petalMesh, baseTilt: -0.45 });
        }

        // 3. The 3 Bioluminescent Ruby Saffron Stigmas (Centerpiece)
        const stigmaGroup = new THREE.Group();
        artifactGroup.add(stigmaGroup);

        const stigmas = [];
        const stigmaColors = [0xff2a5f, 0xe6194b, 0xff0044];

        for (let s = 0; s < 3; s++) {
            const angle = (s / 3) * Math.PI * 2;
            const curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(0, 0.8, 0),
                new THREE.Vector3(Math.cos(angle) * 0.6, 2.5, Math.sin(angle) * 0.6),
                new THREE.Vector3(Math.cos(angle) * 1.5, 4.8, Math.sin(angle) * 1.5),
                new THREE.Vector3(Math.cos(angle + 0.3) * 2.4, 6.5, Math.sin(angle + 0.3) * 2.4)
            ]);

            const stigmaGeom = new THREE.TubeGeometry(curve, 24, 0.09, 8, false);
            const stigmaMat = new THREE.MeshStandardMaterial({
                color: stigmaColors[s],
                emissive: stigmaColors[s],
                emissiveIntensity: 0.8,
                roughness: 0.2,
                metalness: 0.6
            });

            const stigmaMesh = new THREE.Mesh(stigmaGeom, stigmaMat);
            stigmaGroup.add(stigmaMesh);

            // Flared trumpet crown at the tip
            const tipGeom = new THREE.ConeGeometry(0.28, 0.6, 12, 1, true);
            const tipMat = new THREE.MeshStandardMaterial({
                color: 0xff2a5f,
                emissive: 0xff2a5f,
                emissiveIntensity: 1.0,
                roughness: 0.1,
                side: THREE.DoubleSide
            });
            const tipMesh = new THREE.Mesh(tipGeom, tipMat);
            tipMesh.position.copy(curve.getPoint(1));
            tipMesh.rotation.x = Math.PI;
            stigmaGroup.add(tipMesh);

            stigmas.push({ mesh: stigmaMesh, curve, tipMesh, baseAngle: angle });
        }

        // 4. Golden Stamens & Luminous Anthers
        for (let a = 0; a < 3; a++) {
            const angle = ((a + 0.5) / 3) * Math.PI * 2;
            const stamenGeom = new THREE.CylinderGeometry(0.04, 0.04, 3.6, 8);
            const stamenMat = new THREE.MeshStandardMaterial({
                color: 0xf5b82e,
                metalness: 0.8,
                roughness: 0.3,
                emissive: 0xf5b82e,
                emissiveIntensity: 0.3
            });
            const stamen = new THREE.Mesh(stamenGeom, stamenMat);
            stamen.position.set(Math.cos(angle) * 0.5, 2.2, Math.sin(angle) * 0.5);
            stamen.rotation.x = Math.sin(angle) * 0.2;
            stamen.rotation.z = -Math.cos(angle) * 0.2;
            flowerGroup.add(stamen);

            // Pollen glowing cap
            const pollenGeom = new THREE.SphereGeometry(0.18, 12, 12);
            const pollenMat = new THREE.MeshStandardMaterial({
                color: 0xffd166,
                emissive: 0xffd166,
                emissiveIntensity: 0.7,
                roughness: 0.2
            });
            const pollen = new THREE.Mesh(pollenGeom, pollenMat);
            pollen.position.set(Math.cos(angle) * 0.6, 4.0, Math.sin(angle) * 0.6);
            flowerGroup.add(pollen);
        }

        // 5. Central Bio-Core (Pulsing Heart)
        const coreGeom = new THREE.IcosahedronGeometry(1.0, 3);
        const coreMat = new THREE.MeshStandardMaterial({
            color: 0xf5b82e,
            emissive: 0xf5b82e,
            emissiveIntensity: 0.5,
            wireframe: true
        });
        const coreMesh = new THREE.Mesh(coreGeom, coreMat);
        coreMesh.position.y = 1.0;
        artifactGroup.add(coreMesh);

        // 6. Vast Golden Nebula Vortex (1,500 particles)
        const particleCount = 1400;
        const particleGeom = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        const goldColor = new THREE.Color(0xf5b82e);
        const rubyColor = new THREE.Color(0xff2a5f);
        const violetColor = new THREE.Color(0xb388ff);

        for (let p = 0; p < particleCount; p++) {
            // Spiral distribution
            const theta = Math.random() * Math.PI * 2;
            const rad = 3 + Math.pow(Math.random(), 1.5) * 35;
            const y = (Math.random() - 0.5) * 22;

            positions[p * 3] = Math.cos(theta) * rad;
            positions[p * 3 + 1] = y;
            positions[p * 3 + 2] = Math.sin(theta) * rad;

            // Gradient particle coloring
            const mix = Math.random();
            let c = goldColor;
            if (mix > 0.65) c = rubyColor;
            else if (mix > 0.85) c = violetColor;

            colors[p * 3] = c.r;
            colors[p * 3 + 1] = c.g;
            colors[p * 3 + 2] = c.b;

            sizes[p] = Math.random() * 1.8 + 0.4;
        }

        particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleMat = new THREE.PointsMaterial({
            size: 0.9,
            vertexColors: true,
            map: sharedGlowTexture,
            transparent: true,
            opacity: 0.75,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const particleSystem = new THREE.Points(particleGeom, particleMat);
        scene.add(particleSystem);

        // 7. Cinematic Lighting
        const ambientLight = new THREE.AmbientLight(0x0d1428, 1.2);
        scene.add(ambientLight);

        const centralRubyLight = new THREE.PointLight(0xff2a5f, 2.8, 60);
        centralRubyLight.position.set(0, 3, 0);
        scene.add(centralRubyLight);

        const goldSunLight = new THREE.DirectionalLight(0xffd166, 1.6);
        goldSunLight.position.set(20, 25, 20);
        scene.add(goldSunLight);

        const violetRimLight = new THREE.PointLight(0x8a2be2, 2.2, 50);
        violetRimLight.position.set(-20, -10, -15);
        scene.add(violetRimLight);

        // Mouse Drag Orbit Controls
        let isDragging = false;
        let prevMouseX = 0, prevMouseY = 0;
        let rotVelocityX = 0, rotVelocityY = 0;

        canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            prevMouseX = e.clientX;
            prevMouseY = e.clientY;
        });

        window.addEventListener('mouseup', () => { isDragging = false; });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - prevMouseX;
            const deltaY = e.clientY - prevMouseY;
            rotVelocityY += deltaX * 0.003;
            rotVelocityX += deltaY * 0.003;
            prevMouseX = e.clientX;
            prevMouseY = e.clientY;
        });

        // Bloom Shockwave Trigger
        let shockwaveActive = false;
        let shockwaveProgress = 0;
        const shockwaveBtn = document.getElementById('heroBloomTrigger');

        function triggerBloomShockwave() {
            shockwaveActive = true;
            shockwaveProgress = 0;
            if (window.soundFX) window.soundFX.playBloom();
        }

        if (shockwaveBtn) {
            shockwaveBtn.addEventListener('click', triggerBloomShockwave);
        }

        canvas.addEventListener('dblclick', triggerBloomShockwave);

        // Visibility Observer for 60fps Optimization
        const heroSection = document.getElementById('hero');
        let heroVisible = true;
        createObserver(heroSection, () => { heroVisible = true; }, () => { heroVisible = false; });

        // Master Animation Loop
        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);

            if (!heroVisible) return;

            const elapsed = clock.getElapsedTime();

            // 1. Gyroscopic Rings Rotation
            rings.forEach(r => {
                r.mesh.rotation.x += r.speedX;
                r.mesh.rotation.y += r.speedY;
            });

            // 2. Petal Breathing & Organic Flaring
            const breathe = Math.sin(elapsed * 1.5) * 0.08;
            let bloomExpansion = 0;

            if (shockwaveActive) {
                shockwaveProgress += 0.03;
                bloomExpansion = Math.sin(shockwaveProgress * Math.PI) * 0.6;
                centralRubyLight.intensity = 2.8 + Math.sin(shockwaveProgress * Math.PI) * 5.0;
                if (shockwaveProgress >= 1) shockwaveActive = false;
            }

            petals.forEach((p, idx) => {
                const individualOffset = Math.sin(elapsed * 2 + idx) * 0.04;
                p.mesh.rotation.x = p.baseTilt - (breathe + individualOffset + bloomExpansion);
            });

            // 3. Stigma Living Undulation
            stigmaGroup.rotation.y = elapsed * 0.12;
            stigmaGroup.position.y = Math.sin(elapsed * 2) * 0.2;
            const pulse = 0.7 + Math.sin(elapsed * 3) * 0.3;
            centralRubyLight.intensity = 2.4 + pulse;

            // 4. Bio-Core Inner Pulse
            coreMesh.rotation.y = -elapsed * 0.5;
            coreMesh.rotation.x = elapsed * 0.3;
            coreMesh.scale.setScalar(1 + Math.sin(elapsed * 2.5) * 0.08);

            // 5. Particle Vortex Swirling
            particleSystem.rotation.y = elapsed * 0.03;
            particleSystem.rotation.x = Math.sin(elapsed * 0.02) * 0.08;

            // 6. Inertial Rotation & Mouse Drag Response
            artifactGroup.rotation.y += rotVelocityY;
            artifactGroup.rotation.x += rotVelocityX;
            rotVelocityX *= 0.94;
            rotVelocityY *= 0.94;

            // Smooth mouse follow parallax on camera
            const targetCamX = mouse.nx * 5;
            const targetCamY = mouse.ny * 3;
            camera.position.x = lerp(camera.position.x, targetCamX, 0.04);
            camera.position.y = lerp(camera.position.y, targetCamY, 0.04);

            // Scroll Zoom Choreography
            const scrollY = window.scrollY;
            const scrollProgress = clamp(scrollY / window.innerHeight, 0, 1.5);
            camera.position.z = 42 - scrollProgress * 15;
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
        }

        animate();

        // Responsive Resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }, { passive: true });
    }

    // ==========================================================================
    //  SCENE 02: 3D PRODUCT VAULT SPECIMEN CAPSULE
    // ==========================================================================
    function initVaultScene() {
        const canvas = document.getElementById('vaultCanvas');
        if (!canvas) return;

        const container = canvas.parentElement;
        const width = container.clientWidth || 400;
        const height = container.clientHeight || 380;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 0, 15);

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Capsule Master Group
        const capsuleGroup = new THREE.Group();
        scene.add(capsuleGroup);

        // 1. Crystal Outer Glass Shell
        const glassGeom = new THREE.CylinderGeometry(2.4, 2.4, 6.2, 32, 1, true);
        const glassMat = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.28,
            roughness: 0.05,
            metalness: 0.1,
            transmission: 0.9,
            ior: 1.5,
            reflectivity: 0.9,
            side: THREE.DoubleSide
        });
        const glassCylinder = new THREE.Mesh(glassGeom, glassMat);
        capsuleGroup.add(glassCylinder);

        // Top & Bottom Gold Metallic Caps
        const capGeom = new THREE.CylinderGeometry(2.5, 2.5, 0.5, 32);
        const capMat = new THREE.MeshStandardMaterial({
            color: 0xf5b82e,
            roughness: 0.2,
            metalness: 0.9
        });
        const topCap = new THREE.Mesh(capGeom, capMat);
        topCap.position.y = 3.35;
        capsuleGroup.add(topCap);

        const botCap = new THREE.Mesh(capGeom, capMat);
        botCap.position.y = -3.35;
        capsuleGroup.add(botCap);

        // 2. Suspended Saffron Strands Inside Capsule
        const strandGroup = new THREE.Group();
        capsuleGroup.add(strandGroup);

        let strands = [];

        function buildStrands(grade) {
            // Clear existing
            while (strandGroup.children.length > 0) {
                strandGroup.remove(strandGroup.children[0]);
            }
            strands = [];

            const count = grade === 'zarda' ? 180 : (grade === 'lachha' ? 70 : 90);

            for (let i = 0; i < count; i++) {
                if (grade === 'zarda') {
                    // Fine powder / micro-crystals
                    const pGeom = new THREE.TetrahedronGeometry(0.08 + Math.random() * 0.06);
                    const pMat = new THREE.MeshStandardMaterial({
                        color: Math.random() > 0.5 ? 0xf5b82e : 0xff2a5f,
                        emissive: 0xff2a5f,
                        emissiveIntensity: 0.3
                    });
                    const pMesh = new THREE.Mesh(pGeom, pMat);
                    pMesh.position.set(
                        (Math.random() - 0.5) * 3.4,
                        (Math.random() - 0.5) * 4.8,
                        (Math.random() - 0.5) * 3.4
                    );
                    strandGroup.add(pMesh);
                } else {
                    // Full Strands
                    const len = grade === 'mogra' ? (1.2 + Math.random() * 1.5) : (1.8 + Math.random() * 2.2);
                    const pts = [
                        new THREE.Vector3(0, -len * 0.5, 0),
                        new THREE.Vector3((Math.random() - 0.5) * 0.4, 0, (Math.random() - 0.5) * 0.4),
                        new THREE.Vector3((Math.random() - 0.5) * 0.8, len * 0.5, (Math.random() - 0.5) * 0.8)
                    ];
                    const curve = new THREE.CatmullRomCurve3(pts);
                    const geom = new THREE.TubeGeometry(curve, 10, 0.04, 6, false);
                    const color = grade === 'mogra' ? 0xff2a5f : (i % 3 === 0 ? 0xf5b82e : 0xe6194b);
                    const mat = new THREE.MeshStandardMaterial({
                        color,
                        emissive: color,
                        emissiveIntensity: 0.4,
                        roughness: 0.3
                    });
                    const mesh = new THREE.Mesh(geom, mat);
                    mesh.position.set(
                        (Math.random() - 0.5) * 3.2,
                        (Math.random() - 0.5) * 4.5,
                        (Math.random() - 0.5) * 3.2
                    );
                    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
                    strandGroup.add(mesh);
                    strands.push({
                        mesh,
                        rotSpeed: (Math.random() - 0.5) * 0.015,
                        driftY: (Math.random() - 0.5) * 0.005,
                        baseY: mesh.position.y
                    });
                }
            }
        }

        buildStrands('mogra');

        // Lighting
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight.position.set(5, 10, 7);
        scene.add(dirLight);

        const pointLight = new THREE.PointLight(0xf5b82e, 1.5, 20);
        pointLight.position.set(-3, 0, 4);
        scene.add(pointLight);

        // Visibility
        let vaultVisible = true;
        createObserver(canvas.closest('.vault-3d-showcase'), () => { vaultVisible = true; }, () => { vaultVisible = false; });

        // Animation
        const clock = new THREE.Clock();

        function animateVault() {
            requestAnimationFrame(animateVault);
            if (!vaultVisible) return;

            const elapsed = clock.getElapsedTime();

            capsuleGroup.rotation.y = elapsed * 0.4;
            capsuleGroup.rotation.z = Math.sin(elapsed * 0.5) * 0.08;

            strands.forEach(s => {
                s.mesh.rotation.x += s.rotSpeed;
                s.mesh.rotation.y += s.rotSpeed * 0.5;
                s.mesh.position.y = s.baseY + Math.sin(elapsed * 2 + s.baseY) * 0.2;
            });

            renderer.render(scene, camera);
        }

        animateVault();

        // Listen for Grade Switches
        window.addEventListener('vaultGradeChange', (e) => {
            buildStrands(e.detail.grade);
            const nameEl = document.getElementById('vaultCurrentGradeName');
            if (nameEl) {
                const names = {
                    mogra: 'MOGRA GRADE I • 3D SPECIMEN',
                    lachha: 'LACHHA GRADE II • 3D SPECIMEN',
                    zarda: 'ZARDA GRADE III • 3D SPECIMEN'
                };
                nameEl.textContent = names[e.detail.grade] || '3D SPECIMEN';
            }
        });

        // Resize
        window.addEventListener('resize', () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }, { passive: true });
    }

    // ==========================================================================
    //  SCENE 03: BIO-MOLECULAR LATTICE (BENEFITS)
    // ==========================================================================
    function initBenefitsScene() {
        const canvas = document.getElementById('benefitsCanvas');
        if (!canvas) return;

        const container = canvas.parentElement;
        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || 800;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
        camera.position.set(0, 0, 28);

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const molecularGroup = new THREE.Group();
        scene.add(molecularGroup);

        // Core central atom cluster (Crocin Molecule)
        const atoms = [];
        const atomColors = [0xff2a5f, 0xf5b82e, 0x8a2be2, 0x00f5d4];

        for (let a = 0; a < 14; a++) {
            const radius = 0.4 + Math.random() * 0.4;
            const geom = new THREE.SphereGeometry(radius, 16, 16);
            const color = atomColors[a % atomColors.length];
            const mat = new THREE.MeshStandardMaterial({
                color,
                emissive: color,
                emissiveIntensity: 0.5,
                metalness: 0.7,
                roughness: 0.2
            });
            const mesh = new THREE.Mesh(geom, mat);
            mesh.position.set(
                (Math.random() - 0.5) * 12,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8
            );
            molecularGroup.add(mesh);
            atoms.push(mesh);
        }

        // Connecting chemical bond tubes
        for (let b = 0; b < atoms.length - 1; b++) {
            const p1 = atoms[b].position;
            const p2 = atoms[b + 1].position;
            const dist = p1.distanceTo(p2);
            if (dist < 8) {
                const bondGeom = new THREE.CylinderGeometry(0.04, 0.04, dist, 8);
                const bondMat = new THREE.MeshBasicMaterial({
                    color: 0xf5b82e,
                    transparent: true,
                    opacity: 0.35
                });
                const bond = new THREE.Mesh(bondGeom, bondMat);
                bond.position.copy(p1).lerp(p2, 0.5);
                bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
                molecularGroup.add(bond);
            }
        }

        // Orbiting electron rings
        for (let r = 0; r < 3; r++) {
            const ringGeom = new THREE.TorusGeometry(8 + r * 3, 0.02, 8, 80);
            const ringMat = new THREE.MeshBasicMaterial({
                color: 0x00f5d4,
                transparent: true,
                opacity: 0.15
            });
            const ring = new THREE.Mesh(ringGeom, ringMat);
            ring.rotation.x = Math.PI / 2 + r * 0.4;
            ring.rotation.y = r * 0.6;
            molecularGroup.add(ring);
        }

        const ambLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambLight);

        let benefitsVisible = true;
        createObserver(canvas.closest('.benefits'), () => { benefitsVisible = true; }, () => { benefitsVisible = false; });

        const clock = new THREE.Clock();

        function animateBenefits() {
            requestAnimationFrame(animateBenefits);
            if (!benefitsVisible) return;

            const elapsed = clock.getElapsedTime();

            molecularGroup.rotation.y = elapsed * 0.15;
            molecularGroup.rotation.x = Math.sin(elapsed * 0.2) * 0.1;

            camera.position.x = mouse.nx * 2;
            camera.position.y = mouse.ny * 1.5;
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
        }

        animateBenefits();

        window.addEventListener('resize', () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }, { passive: true });
    }

    // ==========================================================================
    //  SCENE 04: KASHMIRI MOUNTAIN MIST & CROCUS PETALS (STORY)
    // ==========================================================================
    function initStoryScene() {
        const canvas = document.getElementById('storyCanvas');
        if (!canvas) return;

        const container = canvas.parentElement;
        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || 700;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 0, 20);

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Tumbling Crocus Petals
        const petalGroup = new THREE.Group();
        scene.add(petalGroup);

        const petals = [];
        const petalColors = [0x7B1FA2, 0x8E24AA, 0x9C27B0, 0xBA68C8];

        for (let i = 0; i < 40; i++) {
            const shape = new THREE.Shape();
            shape.moveTo(0, 0);
            shape.bezierCurveTo(0.4, 0.4, 0.6, 1.2, 0.1, 2.0);
            shape.bezierCurveTo(0, 2.2, 0, 2.2, -0.1, 2.0);
            shape.bezierCurveTo(-0.6, 1.2, -0.4, 0.4, 0, 0);

            const geom = new THREE.ShapeGeometry(shape);
            const color = petalColors[i % petalColors.length];
            const mat = new THREE.MeshStandardMaterial({
                color,
                side: THREE.DoubleSide,
                roughness: 0.5,
                metalness: 0.1
            });
            const mesh = new THREE.Mesh(geom, mat);
            mesh.position.set(
                (Math.random() - 0.5) * 24,
                (Math.random() - 0.5) * 16,
                (Math.random() - 0.5) * 12
            );
            mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            petalGroup.add(mesh);
            petals.push({
                mesh,
                speedY: 0.01 + Math.random() * 0.02,
                rotSpeedX: (Math.random() - 0.5) * 0.02,
                rotSpeedY: (Math.random() - 0.5) * 0.02
            });
        }

        const amb = new THREE.AmbientLight(0xfff8dc, 0.9);
        scene.add(amb);

        let storyVisible = true;
        createObserver(canvas.closest('.story'), () => { storyVisible = true; }, () => { storyVisible = false; });

        function animateStory() {
            requestAnimationFrame(animateStory);
            if (!storyVisible) return;

            petals.forEach(p => {
                p.mesh.position.y -= p.speedY;
                p.mesh.rotation.x += p.rotSpeedX;
                p.mesh.rotation.y += p.rotSpeedY;

                if (p.mesh.position.y < -9) {
                    p.mesh.position.y = 9;
                    p.mesh.position.x = (Math.random() - 0.5) * 24;
                }
            });

            renderer.render(scene, camera);
        }

        animateStory();

        window.addEventListener('resize', () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }, { passive: true });
    }

    // ==========================================================================
    //  SCENE 05: INTERACTIVE FLUID INFUSION SIMULATOR (CANVAS)
    // ==========================================================================
    function initInfusionSimulator() {
        const canvas = document.getElementById('infusionCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const triggerBtn = document.getElementById('infusionTriggerBtn');
        const statusText = document.getElementById('infusionStatusText');

        function resize() {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;
        }
        resize();
        window.addEventListener('resize', resize, { passive: true });

        let particles = [];
        let strands = [];
        let isInfusing = false;
        let ambientGoldLevel = 0; // 0 to 1

        class SaffronStrand {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.length = 40 + Math.random() * 20;
                this.angle = Math.random() * Math.PI;
                this.velY = 0.8 + Math.random() * 0.6;
                this.sway = Math.random() * 2;
            }
            update() {
                this.y += this.velY;
                this.angle += 0.02;
                if (this.y > canvas.height * 0.65) {
                    this.velY *= 0.96;
                }
            }
            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);
                ctx.strokeStyle = '#ff2a5f';
                ctx.lineWidth = 3;
                ctx.shadowColor = '#ff2a5f';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.moveTo(-this.length / 2, 0);
                ctx.quadraticCurveTo(0, 8, this.length / 2, 0);
                ctx.stroke();
                ctx.restore();
            }
        }

        class DyeParticle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.vx = (Math.random() - 0.5) * 2.2;
                this.vy = (Math.random() - 0.5) * 1.8;
                this.radius = 2 + Math.random() * 5;
                this.alpha = 0.8;
                this.life = 0;
                this.maxLife = 120 + Math.random() * 80;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.vx *= 0.98;
                this.vy *= 0.98;
                this.radius += 0.08;
                this.alpha -= 0.005;
                this.life++;
            }
            draw() {
                if (this.alpha <= 0) return;
                ctx.save();
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
                grad.addColorStop(0, `rgba(255, 209, 102, ${this.alpha * 0.6})`);
                grad.addColorStop(0.5, `rgba(245, 184, 46, ${this.alpha * 0.3})`);
                grad.addColorStop(1, 'rgba(245, 184, 46, 0)');
                ctx.fillStyle = grad;
                ctx.fill();
                ctx.restore();
            }
        }

        function infuse() {
            if (isInfusing) return;
            isInfusing = true;
            if (statusText) statusText.textContent = 'INFUSION IN PROGRESS: CROCIN DYE BLOOMING AT 65°C...';

            if (window.soundFX) window.soundFX.playInfuse();

            // Drop 4 strands
            for (let i = 0; i < 4; i++) {
                setTimeout(() => {
                    strands.push(new SaffronStrand(
                        canvas.width * 0.3 + (i / 4) * (canvas.width * 0.4),
                        20
                    ));
                }, i * 250);
            }

            // Spawn dye clouds over 6 seconds
            let timer = setInterval(() => {
                strands.forEach(s => {
                    for (let p = 0; p < 6; p++) {
                        particles.push(new DyeParticle(s.x + (Math.random() - 0.5) * 20, s.y));
                    }
                });
                ambientGoldLevel = Math.min(ambientGoldLevel + 0.015, 0.85);
            }, 60);

            setTimeout(() => {
                clearInterval(timer);
                if (statusText) statusText.textContent = 'INFUSION COMPLETE: AUTHENTIC LIQUID GOLD (CRO = 264)';
                setTimeout(() => { isInfusing = false; }, 2000);
            }, 6500);
        }

        if (triggerBtn) {
            triggerBtn.addEventListener('click', infuse);
        }

        // Animation Loop
        function render() {
            requestAnimationFrame(render);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Ambient background glow from diffused saffron
            if (ambientGoldLevel > 0) {
                const bgGrad = ctx.createRadialGradient(
                    canvas.width / 2, canvas.height / 2, 20,
                    canvas.width / 2, canvas.height / 2, canvas.width / 2
                );
                bgGrad.addColorStop(0, `rgba(245, 184, 46, ${ambientGoldLevel * 0.45})`);
                bgGrad.addColorStop(0.7, `rgba(230, 25, 75, ${ambientGoldLevel * 0.15})`);
                bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = bgGrad;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            // Update & Draw Particles
            particles = particles.filter(p => p.alpha > 0);
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            // Update & Draw Strands
            strands.forEach(s => {
                s.update();
                s.draw();
            });
        }
        render();
    }

    // ==========================================================================
    //  INITIALIZATION SEQUENCE
    // ==========================================================================
    function bootEngine() {
        initHeroScene();
        initVaultScene();
        initBenefitsScene();
        initStoryScene();
        initInfusionSimulator();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootEngine);
    } else {
        bootEngine();
    }

})();
