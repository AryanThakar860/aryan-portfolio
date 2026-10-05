/* =============================================
   SHREEJI SAFFRON – Three.js 3D Scenes
   Floating Saffron Threads | Crocus Flower | Orbiting Particles
   ============================================= */

(function () {
    'use strict';

    // =============================================
    //  UTILITIES
    // =============================================

    function clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    // Shared mouse tracking
    const mouse = { x: 0, y: 0, nx: 0, ny: 0 };
    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.nx = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.ny = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // IntersectionObserver helper for performance — only render when visible
    function createVisibilityObserver(element, callbacks) {
        let isVisible = false;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isVisible = entry.isIntersecting;
                if (isVisible && callbacks.onEnter) callbacks.onEnter();
                if (!isVisible && callbacks.onLeave) callbacks.onLeave();
            });
        }, { threshold: 0.05 });
        observer.observe(element);
        return { get visible() { return isVisible; } };
    }

    // =============================================
    //  SCENE 1: HERO — FLOATING SAFFRON THREADS
    // =============================================

    function initHeroScene() {
        const canvas = document.getElementById('heroCanvas');
        if (!canvas) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 50;

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);

        // --- Saffron Thread Colors ---
        const threadColors = [
            0x8B0000, // deep red
            0xA01010, // rich red
            0xC41E3A, // crimson
            0xB22222, // firebrick
            0x8B1A1A, // dark crimson
            0xD4AF37, // gold accent
            0xCC3333, // bright crimson
        ];

        // --- Create Saffron Threads ---
        const threads = [];
        const threadCount = 150;

        for (let i = 0; i < threadCount; i++) {
            const curvePoints = [];
            const segments = 8;
            const length = 1.5 + Math.random() * 3;
            const curvature = (Math.random() - 0.5) * 0.8;

            for (let j = 0; j <= segments; j++) {
                const t = j / segments;
                const x = Math.sin(t * Math.PI * curvature) * length * 0.3;
                const y = (t - 0.5) * length;
                const z = Math.cos(t * Math.PI * curvature * 0.5) * length * 0.15;
                curvePoints.push(new THREE.Vector3(x, y, z));
            }

            const curve = new THREE.CatmullRomCurve3(curvePoints);
            const geometry = new THREE.TubeGeometry(curve, 12, 0.03 + Math.random() * 0.04, 6, false);

            const color = threadColors[Math.floor(Math.random() * threadColors.length)];
            const material = new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.4,
                metalness: 0.3,
                emissive: color,
                emissiveIntensity: 0.15,
            });

            const mesh = new THREE.Mesh(geometry, material);

            // Spread threads in 3D space
            mesh.position.set(
                (Math.random() - 0.5) * 80,
                (Math.random() - 0.5) * 60,
                (Math.random() - 0.5) * 40 - 10
            );

            mesh.rotation.set(
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2
            );

            // Store animation data
            mesh.userData = {
                speed: 0.0005 + Math.random() * 0.001,
                rotSpeed: (Math.random() - 0.5) * 0.003,
                driftX: (Math.random() - 0.5) * 0.01,
                driftY: (Math.random() - 0.5) * 0.008,
                originalY: mesh.position.y,
                floatOffset: Math.random() * Math.PI * 2,
                floatAmplitude: 0.3 + Math.random() * 0.7,
            };

            scene.add(mesh);
            threads.push(mesh);
        }

        // --- Golden Particles ---
        const particleCount = 500;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 60 - 10;
            sizes[i] = Math.random() * 2 + 0.5;
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const particleTexture = createGlowTexture();

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.8,
            map: particleTexture,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            color: 0xD4AF37,
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);

        // --- Lighting ---
        const ambientLight = new THREE.AmbientLight(0xfff8dc, 0.4);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xD4AF37, 0.8);
        directionalLight.position.set(10, 20, 15);
        scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0xC41E3A, 0.5, 80);
        pointLight.position.set(-15, 10, 20);
        scene.add(pointLight);

        const pointLight2 = new THREE.PointLight(0xD4AF37, 0.4, 80);
        pointLight2.position.set(15, -10, 25);
        scene.add(pointLight2);

        // --- Mouse target for smooth follow ---
        let mouseTargetX = 0, mouseTargetY = 0;

        // --- Animation Loop ---
        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);

            const elapsed = clock.getElapsedTime();

            // Smooth mouse follow
            mouseTargetX = lerp(mouseTargetX, mouse.nx * 5, 0.02);
            mouseTargetY = lerp(mouseTargetY, mouse.ny * 3, 0.02);

            // Animate threads
            threads.forEach(thread => {
                const d = thread.userData;
                thread.rotation.x += d.rotSpeed;
                thread.rotation.z += d.rotSpeed * 0.5;
                thread.position.y = d.originalY + Math.sin(elapsed * d.speed * 500 + d.floatOffset) * d.floatAmplitude;
                thread.position.x += d.driftX;

                // Wrap around if threads drift too far
                if (thread.position.x > 45) thread.position.x = -45;
                if (thread.position.x < -45) thread.position.x = 45;
            });

            // Animate particles — slow rotation
            particles.rotation.y = elapsed * 0.02;
            particles.rotation.x = Math.sin(elapsed * 0.01) * 0.1;

            // Camera subtle follow mouse
            camera.position.x = lerp(camera.position.x, mouseTargetX, 0.05);
            camera.position.y = lerp(camera.position.y, mouseTargetY, 0.05);
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
        }

        animate();

        // --- Handle Resize ---
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // =============================================
    //  SCENE 2: STORY — ROTATING SAFFRON CROCUS
    // =============================================

    function initStoryScene() {
        const canvas = document.getElementById('storyCanvas');
        if (!canvas) return;

        const container = canvas.parentElement;
        const width = container.clientWidth;
        const height = container.clientHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 2, 8);
        camera.lookAt(0, 1, 0);

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);

        // --- Build Crocus Flower ---
        const flowerGroup = new THREE.Group();

        // Petals (6 purple petals)
        const petalCount = 6;
        const petalColors = [0x7B2D8E, 0x8E3EA0, 0x6A1B82, 0x9B4DCA, 0x7B2D8E, 0x8E3EA0];

        for (let i = 0; i < petalCount; i++) {
            const petalShape = new THREE.Shape();
            petalShape.moveTo(0, 0);
            petalShape.bezierCurveTo(0.5, 0.5, 0.6, 1.5, 0.15, 2.8);
            petalShape.bezierCurveTo(0, 3.2, 0, 3.2, -0.15, 2.8);
            petalShape.bezierCurveTo(-0.6, 1.5, -0.5, 0.5, 0, 0);

            const extrudeSettings = {
                depth: 0.04,
                bevelEnabled: true,
                bevelThickness: 0.02,
                bevelSize: 0.02,
                bevelSegments: 3,
            };

            const petalGeom = new THREE.ExtrudeGeometry(petalShape, extrudeSettings);
            const petalMat = new THREE.MeshStandardMaterial({
                color: petalColors[i],
                roughness: 0.6,
                metalness: 0.1,
                side: THREE.DoubleSide,
                emissive: petalColors[i],
                emissiveIntensity: 0.08,
            });

            const petal = new THREE.Mesh(petalGeom, petalMat);
            const angle = (i / petalCount) * Math.PI * 2;
            petal.rotation.z = angle;
            petal.rotation.x = -0.3; // Slight outward tilt
            petal.position.y = 0.2;
            flowerGroup.add(petal);
        }

        // Stigma (3 crimson threads — the actual saffron!)
        const stigmaColors = [0xC41E3A, 0x8B0000, 0xB22222];
        for (let i = 0; i < 3; i++) {
            const stigmaCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(0, 0.3, 0),
                new THREE.Vector3(
                    Math.sin((i / 3) * Math.PI * 2) * 0.25,
                    1.5,
                    Math.cos((i / 3) * Math.PI * 2) * 0.25
                ),
                new THREE.Vector3(
                    Math.sin((i / 3) * Math.PI * 2) * 0.5,
                    2.8,
                    Math.cos((i / 3) * Math.PI * 2) * 0.5
                ),
                new THREE.Vector3(
                    Math.sin((i / 3) * Math.PI * 2) * 0.6,
                    3.4,
                    Math.cos((i / 3) * Math.PI * 2) * 0.6
                ),
            ]);

            const stigmaGeom = new THREE.TubeGeometry(stigmaCurve, 16, 0.04, 6, false);
            const stigmaMat = new THREE.MeshStandardMaterial({
                color: stigmaColors[i],
                roughness: 0.3,
                metalness: 0.4,
                emissive: stigmaColors[i],
                emissiveIntensity: 0.25,
            });

            const stigma = new THREE.Mesh(stigmaGeom, stigmaMat);
            flowerGroup.add(stigma);

            // Stigma tip — small sphere for the flared top
            const tipGeom = new THREE.SphereGeometry(0.08, 8, 8);
            const tipMat = new THREE.MeshStandardMaterial({
                color: 0xC41E3A,
                emissive: 0xC41E3A,
                emissiveIntensity: 0.35,
                roughness: 0.3,
            });
            const tip = new THREE.Mesh(tipGeom, tipMat);
            tip.position.copy(stigmaCurve.getPoint(1));
            flowerGroup.add(tip);
        }

        // Stamen (golden center details)
        for (let i = 0; i < 3; i++) {
            const stamenGeom = new THREE.CylinderGeometry(0.02, 0.015, 1.8, 6);
            const stamenMat = new THREE.MeshStandardMaterial({
                color: 0xD4AF37,
                emissive: 0xD4AF37,
                emissiveIntensity: 0.3,
                roughness: 0.4,
                metalness: 0.5,
            });
            const stamen = new THREE.Mesh(stamenGeom, stamenMat);
            const angle = ((i + 0.5) / 3) * Math.PI * 2;
            stamen.position.set(
                Math.sin(angle) * 0.15,
                1.2,
                Math.cos(angle) * 0.15
            );
            stamen.rotation.x = Math.sin(angle) * 0.15;
            stamen.rotation.z = -Math.cos(angle) * 0.15;

            // Pollen tip
            const pollenGeom = new THREE.SphereGeometry(0.05, 6, 6);
            const pollenMat = new THREE.MeshStandardMaterial({
                color: 0xF0D060,
                emissive: 0xF0D060,
                emissiveIntensity: 0.4,
            });
            const pollen = new THREE.Mesh(pollenGeom, pollenMat);
            pollen.position.set(
                Math.sin(angle) * 0.18,
                2.1,
                Math.cos(angle) * 0.18
            );
            flowerGroup.add(stamen, pollen);
        }

        // Center bulb
        const bulbGeom = new THREE.SphereGeometry(0.25, 12, 12);
        const bulbMat = new THREE.MeshStandardMaterial({
            color: 0x2d6a4f,
            roughness: 0.7,
        });
        const bulb = new THREE.Mesh(bulbGeom, bulbMat);
        bulb.position.y = 0.1;
        bulb.scale.y = 1.5;
        flowerGroup.add(bulb);

        // Stem
        const stemCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, -3, 0),
            new THREE.Vector3(0.1, -1.5, 0.05),
            new THREE.Vector3(0, 0, 0),
        ]);
        const stemGeom = new THREE.TubeGeometry(stemCurve, 12, 0.06, 6, false);
        const stemMat = new THREE.MeshStandardMaterial({
            color: 0x2d6a4f,
            roughness: 0.7,
        });
        const stem = new THREE.Mesh(stemGeom, stemMat);
        flowerGroup.add(stem);

        scene.add(flowerGroup);

        // --- Floating particles around flower ---
        const fpCount = 80;
        const fpGeom = new THREE.BufferGeometry();
        const fpPositions = new Float32Array(fpCount * 3);
        for (let i = 0; i < fpCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const r = 3 + Math.random() * 3;
            fpPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            fpPositions[i * 3 + 1] = r * Math.cos(phi) + 1;
            fpPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
        }
        fpGeom.setAttribute('position', new THREE.BufferAttribute(fpPositions, 3));
        const fpMat = new THREE.PointsMaterial({
            size: 0.12,
            color: 0xD4AF37,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            map: createGlowTexture(),
        });
        const fpPoints = new THREE.Points(fpGeom, fpMat);
        scene.add(fpPoints);

        // --- Lighting ---
        const ambientLight = new THREE.AmbientLight(0xfff8dc, 0.5);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
        dirLight.position.set(5, 8, 5);
        scene.add(dirLight);

        const goldenLight = new THREE.PointLight(0xD4AF37, 0.6, 20);
        goldenLight.position.set(-3, 4, 3);
        scene.add(goldenLight);

        const rimLight = new THREE.PointLight(0xC41E3A, 0.4, 15);
        rimLight.position.set(3, 2, -3);
        scene.add(rimLight);

        // --- Visibility observer ---
        const storySection = document.getElementById('story');
        let isVisible = false;
        if (storySection) {
            const vis = createVisibilityObserver(storySection, {
                onEnter: () => { isVisible = true; },
                onLeave: () => { isVisible = false; },
            });
        }

        // --- Mouse tracking for this section ---
        let localMouseX = 0, localMouseY = 0;

        // --- Animation ---
        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);

            if (!isVisible) return;

            const elapsed = clock.getElapsedTime();

            // Smooth mouse follow for gentle rotation
            localMouseX = lerp(localMouseX, mouse.nx * 0.5, 0.03);
            localMouseY = lerp(localMouseY, mouse.ny * 0.3, 0.03);

            flowerGroup.rotation.y = elapsed * 0.15 + localMouseX;
            flowerGroup.rotation.x = Math.sin(elapsed * 0.3) * 0.05 + localMouseY * 0.2;

            // Floating particles orbit
            fpPoints.rotation.y = elapsed * 0.08;

            renderer.render(scene, camera);
        }

        animate();

        // --- Handle Resize ---
        window.addEventListener('resize', () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        });
    }

    // =============================================
    //  SCENE 3: BENEFITS — ORBITING GOLDEN PARTICLES
    // =============================================

    function initBenefitsScene() {
        const canvas = document.getElementById('benefitsCanvas');
        if (!canvas) return;

        const container = canvas.parentElement;
        const width = container.clientWidth;
        const height = container.clientHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 200);
        camera.position.z = 30;

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);

        // --- Central Glowing Sphere ---
        const centralGeom = new THREE.SphereGeometry(2, 32, 32);
        const centralMat = new THREE.MeshStandardMaterial({
            color: 0xD4AF37,
            emissive: 0xD4AF37,
            emissiveIntensity: 0.4,
            roughness: 0.2,
            metalness: 0.8,
            transparent: true,
            opacity: 0.7,
        });
        const centralSphere = new THREE.Mesh(centralGeom, centralMat);
        scene.add(centralSphere);

        // Inner glow sphere
        const glowGeom = new THREE.SphereGeometry(2.5, 32, 32);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0xD4AF37,
            transparent: true,
            opacity: 0.08,
            side: THREE.BackSide,
        });
        const glowSphere = new THREE.Mesh(glowGeom, glowMat);
        scene.add(glowSphere);

        // --- Orbiting Particles (6 for the 6 benefit cards) ---
        const orbiters = [];
        const orbiterColors = [0xD4AF37, 0xF0D060, 0xC41E3A, 0xB8960C, 0x8B0000, 0xF0D060];

        for (let i = 0; i < 6; i++) {
            const orbiterGeom = new THREE.SphereGeometry(0.4, 16, 16);
            const orbiterMat = new THREE.MeshStandardMaterial({
                color: orbiterColors[i],
                emissive: orbiterColors[i],
                emissiveIntensity: 0.5,
                roughness: 0.3,
                metalness: 0.6,
            });
            const orbiter = new THREE.Mesh(orbiterGeom, orbiterMat);

            // Unique orbit parameters
            orbiter.userData = {
                radius: 6 + Math.random() * 4,
                speed: 0.3 + Math.random() * 0.4,
                offset: (i / 6) * Math.PI * 2,
                tiltX: (Math.random() - 0.5) * 0.8,
                tiltZ: (Math.random() - 0.5) * 0.4,
                eccentricity: 0.7 + Math.random() * 0.3,  // elliptical orbit
            };

            scene.add(orbiter);
            orbiters.push(orbiter);
        }

        // --- Trail / Connecting Lines ---
        const ringCount = 3;
        for (let i = 0; i < ringCount; i++) {
            const ringGeom = new THREE.TorusGeometry(6 + i * 2, 0.02, 8, 100);
            const ringMat = new THREE.MeshBasicMaterial({
                color: 0xD4AF37,
                transparent: true,
                opacity: 0.1,
            });
            const ring = new THREE.Mesh(ringGeom, ringMat);
            ring.rotation.x = Math.PI / 2 + (i - 1) * 0.3;
            ring.rotation.z = i * 0.2;
            scene.add(ring);
        }

        // --- Floating Dust Particles ---
        const dustCount = 300;
        const dustGeom = new THREE.BufferGeometry();
        const dustPositions = new Float32Array(dustCount * 3);
        for (let i = 0; i < dustCount; i++) {
            dustPositions[i * 3] = (Math.random() - 0.5) * 50;
            dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 50;
            dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 30;
        }
        dustGeom.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
        const dustMat = new THREE.PointsMaterial({
            size: 0.3,
            color: 0xD4AF37,
            transparent: true,
            opacity: 0.35,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            map: createGlowTexture(),
        });
        const dustParticles = new THREE.Points(dustGeom, dustMat);
        scene.add(dustParticles);

        // --- Lighting ---
        const ambientLight = new THREE.AmbientLight(0xfff8dc, 0.3);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xD4AF37, 1.0, 50);
        pointLight.position.set(0, 0, 0);
        scene.add(pointLight);

        // --- Visibility observer ---
        const benefitsSection = document.getElementById('benefits');
        let isVisible = false;
        if (benefitsSection) {
            createVisibilityObserver(benefitsSection, {
                onEnter: () => { isVisible = true; },
                onLeave: () => { isVisible = false; },
            });
        }

        // --- Animation ---
        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);

            if (!isVisible) return;

            const elapsed = clock.getElapsedTime();

            // Central sphere pulsing glow
            const pulse = 0.3 + Math.sin(elapsed * 1.5) * 0.15;
            centralMat.emissiveIntensity = pulse;
            glowSphere.scale.setScalar(1 + Math.sin(elapsed * 1.2) * 0.05);
            glowMat.opacity = 0.05 + Math.sin(elapsed * 1.5) * 0.03;

            // Orbiting particles
            orbiters.forEach(orbiter => {
                const d = orbiter.userData;
                const angle = elapsed * d.speed + d.offset;
                orbiter.position.x = Math.cos(angle) * d.radius;
                orbiter.position.y = Math.sin(angle) * d.radius * d.eccentricity + Math.sin(elapsed * 0.5) * d.tiltX;
                orbiter.position.z = Math.sin(angle * 0.7) * d.radius * 0.3 + d.tiltZ;
            });

            // Dust rotation
            dustParticles.rotation.y = elapsed * 0.015;
            dustParticles.rotation.x = Math.sin(elapsed * 0.01) * 0.05;

            // Central sphere gentle rotation
            centralSphere.rotation.y = elapsed * 0.1;
            centralSphere.rotation.x = Math.sin(elapsed * 0.2) * 0.1;

            // Camera subtle sway
            camera.position.x = Math.sin(elapsed * 0.2) * 2;
            camera.position.y = Math.cos(elapsed * 0.15) * 1.5;
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
        }

        animate();

        // --- Handle Resize ---
        window.addEventListener('resize', () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        });
    }

    // =============================================
    //  SHARED: CREATE GLOW TEXTURE (Procedural)
    // =============================================

    function createGlowTexture() {
        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        gradient.addColorStop(0, 'rgba(255, 220, 120, 1)');
        gradient.addColorStop(0.3, 'rgba(212, 175, 55, 0.6)');
        gradient.addColorStop(0.7, 'rgba(212, 175, 55, 0.15)');
        gradient.addColorStop(1, 'rgba(212, 175, 55, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    // =============================================
    //  INITIALIZATION
    // =============================================

    // Wait for splash screen to finish, then init scenes
    function init() {
        // Small delay to ensure splash screen has started fading
        setTimeout(() => {
            initHeroScene();
            initStoryScene();
            initBenefitsScene();
        }, 1800);
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
