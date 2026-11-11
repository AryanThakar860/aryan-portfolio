/* ==========================================================================
   ARYAN THAKAR — CINEMATIC 3D ENGINE & SPATIAL ENVIRONMENT
   Quantum Neural Monolith | 3D Cyber Threat Mesh | Specimen Vault | WebGL Physics
   ========================================================================== */

(function () {
    'use strict';

    // Global check for WebGL support with graceful fallback
    function hasWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    if (!hasWebGL()) {
        console.warn('[WebGL Fallback]: WebGL is not supported on this device. Fallback static holographic grid enabled.');
        document.body.classList.add('no-webgl');
        const fallback = document.getElementById('webglFallback');
        if (fallback) fallback.style.display = 'block';
        return;
    }

    // ---------- MATH & UTILITY HELPERS ----------
    const lerp = (a, b, t) => a + (b - a) * t;
    const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

    // Global mouse tracking
    const mouse = {
        x: 0, y: 0,
        nx: 0, ny: 0, // normalized [-1, 1]
        isDown: false,
        prevX: 0, prevY: 0
    };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.nx = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.ny = -(e.clientY / window.innerHeight) * 2 + 1;
    }, { passive: true });

    // 60FPS Visibility Observer
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

    // Procedural Glowing Particle Texture
    function createGlowTexture(coreColor, edgeColor) {
        const size = 128;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        gradient.addColorStop(0, coreColor || 'rgba(0, 240, 255, 1)');
        gradient.addColorStop(0.25, 'rgba(0, 240, 255, 0.7)');
        gradient.addColorStop(0.6, edgeColor || 'rgba(139, 92, 246, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        return new THREE.CanvasTexture(canvas);
    }

    const sharedGlowTexture = createGlowTexture();

    // ==========================================================================
    //  SCENE 01: HERO — QUANTUM NEURAL MONOLITH & ORBITAL MATRIX
    // ==========================================================================
    function initHeroScene() {
        const canvas = document.getElementById('heroCanvas');
        if (!canvas) return;

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x03050e, 0.018);

        const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 1000);
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

        // Master 3D Group
        const monolithMasterGroup = new THREE.Group();
        scene.add(monolithMasterGroup);

        // 1. The Central Futuristic Monolith Obelisk
        const obeliskGroup = new THREE.Group();
        monolithMasterGroup.add(obeliskGroup);

        // Monolith Titanium Body
        const obeliskGeom = new THREE.CylinderGeometry(2.6, 3.4, 13.5, 6, 1, false);
        const obeliskMat = new THREE.MeshStandardMaterial({
            color: 0x0a101d,
            roughness: 0.18,
            metalness: 0.94,
            flatShading: true
        });
        const obeliskMesh = new THREE.Mesh(obeliskGeom, obeliskMat);
        obeliskGroup.add(obeliskMesh);

        // Glowing Core Energy Grooves (Wireframe accent)
        const wireframeGeom = new THREE.WireframeGeometry(obeliskGeom);
        const wireframeMat = new THREE.LineBasicMaterial({
            color: 0x00f0ff,
            transparent: true,
            opacity: 0.35,
            blending: THREE.AdditiveBlending
        });
        const wireframeMesh = new THREE.LineSegments(wireframeGeom, wireframeMat);
        obeliskMesh.add(wireframeMesh);

        // 2. Floating Quantum Core (Inside Center Aperture)
        const coreGeom = new THREE.IcosahedronGeometry(2.0, 1);
        const coreMat = new THREE.MeshPhysicalMaterial({
            color: 0x8b5cf6,
            emissive: 0x00f0ff,
            emissiveIntensity: 0.6,
            roughness: 0.12,
            metalness: 0.88,
            wireframe: false
        });
        const quantumCoreMesh = new THREE.Mesh(coreGeom, coreMat);
        quantumCoreMesh.position.y = 0;
        obeliskGroup.add(quantumCoreMesh);

        // Inner core wireframe cage
        const coreWireGeom = new THREE.IcosahedronGeometry(2.35, 1);
        const coreWireMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            wireframe: true,
            transparent: true,
            opacity: 0.75
        });
        const coreWireMesh = new THREE.Mesh(coreWireGeom, coreWireMat);
        quantumCoreMesh.add(coreWireMesh);

        // 3. Counter-Rotating Gyroscopic Orbital Gimbals
        const gimbalsGroup = new THREE.Group();
        monolithMasterGroup.add(gimbalsGroup);

        const gimbalMaterials = [
            new THREE.MeshStandardMaterial({
                color: 0x00f0ff,
                roughness: 0.2,
                metalness: 0.9,
                emissive: 0x00f0ff,
                emissiveIntensity: 0.25
            }),
            new THREE.MeshStandardMaterial({
                color: 0x8b5cf6,
                roughness: 0.25,
                metalness: 0.85,
                emissive: 0x8b5cf6,
                emissiveIntensity: 0.3
            }),
            new THREE.MeshStandardMaterial({
                color: 0xffaa00,
                roughness: 0.3,
                metalness: 0.9,
                emissive: 0xffaa00,
                emissiveIntensity: 0.2
            })
        ];

        const ringConfigs = [
            { radius: 10.5, tube: 0.08, speedX: 0.005, speedY: 0.008, mat: gimbalMaterials[0] },
            { radius: 13.8, tube: 0.10, speedX: -0.006, speedY: 0.004, mat: gimbalMaterials[1] },
            { radius: 16.8, tube: 0.07, speedX: 0.004, speedY: -0.007, mat: gimbalMaterials[2] }
        ];

        const orbitalRings = [];

        ringConfigs.forEach((cfg, idx) => {
            const ringGeom = new THREE.TorusGeometry(cfg.radius, cfg.tube, 16, 120);
            const ringMesh = new THREE.Mesh(ringGeom, cfg.mat);
            ringMesh.rotation.x = Math.PI / (2.2 + idx * 0.5);
            ringMesh.rotation.y = idx * 0.9;
            gimbalsGroup.add(ringMesh);

            // Telemetry Node Markers
            const nodeCount = 8;
            for (let n = 0; n < nodeCount; n++) {
                const angle = (n / nodeCount) * Math.PI * 2;
                const nodeGeom = new THREE.OctahedronGeometry(0.24);
                const nodeMesh = new THREE.Mesh(nodeGeom, cfg.mat);
                nodeMesh.position.set(Math.cos(angle) * cfg.radius, Math.sin(angle) * cfg.radius, 0);
                ringMesh.add(nodeMesh);
            }

            orbitalRings.push({
                mesh: ringMesh,
                speedX: cfg.speedX,
                speedY: cfg.speedY
            });
        });

        // 4. Four Satellite Floating Domain Polyhedra
        const domainShardsGroup = new THREE.Group();
        monolithMasterGroup.add(domainShardsGroup);

        const domainConfigs = [
            { name: '3D WebGL', geom: new THREE.OctahedronGeometry(0.9), color: 0x00f0ff, angle: 0 },
            { name: 'Full-Stack', geom: new THREE.DodecahedronGeometry(0.85), color: 0x00f5a0, angle: Math.PI * 0.5 },
            { name: 'Network CCNA', geom: new THREE.IcosahedronGeometry(0.9), color: 0x8b5cf6, angle: Math.PI },
            { name: 'Threat CEH', geom: new THREE.TetrahedronGeometry(1.0), color: 0xffaa00, angle: Math.PI * 1.5 }
        ];

        const domainNodes = [];
        const orbitRadius = 21.0;

        domainConfigs.forEach(d => {
            const mat = new THREE.MeshStandardMaterial({
                color: d.color,
                roughness: 0.2,
                metalness: 0.8,
                emissive: d.color,
                emissiveIntensity: 0.5
            });
            const mesh = new THREE.Mesh(d.geom, mat);
            
            // Wireframe outer aura
            const wire = new THREE.Mesh(
                d.geom,
                new THREE.MeshBasicMaterial({ color: d.color, wireframe: true, transparent: true, opacity: 0.6 })
            );
            wire.scale.setScalar(1.25);
            mesh.add(wire);

            domainShardsGroup.add(mesh);
            domainNodes.push({
                mesh,
                baseAngle: d.angle,
                color: d.color
            });
        });

        // 5. Volumetric Particle Stardust Constellation
        const particleCount = 1400;
        const particleGeom = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const particleScales = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            const rad = 14 + Math.random() * 32;
            const theta = Math.random() * Math.PI * 2;
            const phi = (Math.random() - 0.5) * Math.PI * 0.9;

            positions[i * 3] = Math.cos(theta) * Math.cos(phi) * rad;
            positions[i * 3 + 1] = Math.sin(phi) * rad + (Math.random() - 0.5) * 8;
            positions[i * 3 + 2] = Math.sin(theta) * Math.cos(phi) * rad;

            particleScales[i] = 0.5 + Math.random() * 1.5;
        }

        particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeom.setAttribute('scale', new THREE.BufferAttribute(particleScales, 1));

        const particleMat = new THREE.PointsMaterial({
            size: 0.65,
            map: sharedGlowTexture,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            color: 0x00f0ff
        });

        const particleSystem = new THREE.Points(particleGeom, particleMat);
        scene.add(particleSystem);

        // 6. Cinematic Lighting Architecture
        const ambientLight = new THREE.AmbientLight(0x060c1d, 1.4);
        scene.add(ambientLight);

        const cyanKeyLight = new THREE.PointLight(0x00f0ff, 3.2, 75);
        cyanKeyLight.position.set(22, 16, 18);
        scene.add(cyanKeyLight);

        const violetFillLight = new THREE.PointLight(0x8b5cf6, 2.8, 65);
        violetFillLight.position.set(-20, -14, -10);
        scene.add(violetFillLight);

        const amberRimLight = new THREE.DirectionalLight(0xffaa00, 1.4);
        amberRimLight.position.set(0, 30, -25);
        scene.add(amberRimLight);

        // 7. Interactive Mouse Drag & Parallax
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
            rotVelocityY += deltaX * 0.0035;
            rotVelocityX += deltaY * 0.0035;
            prevMouseX = e.clientX;
            prevMouseY = e.clientY;
        });

        // 8. Quantum Warp Pulse Shockwave
        let shockwaveActive = false;
        let shockwaveProgress = 0;
        const warpBtn = document.getElementById('heroBloomTrigger');

        function triggerWarpPulse() {
            shockwaveActive = true;
            shockwaveProgress = 0;
            if (window.soundFX) window.soundFX.playBloom();
        }

        if (warpBtn) warpBtn.addEventListener('click', triggerWarpPulse);
        canvas.addEventListener('dblclick', triggerWarpPulse);

        // Domain Chips Hover Interaction
        const domainChips = document.querySelectorAll('.domain-chip');
        domainChips.forEach((chip, idx) => {
            chip.addEventListener('mouseenter', () => {
                if (domainNodes[idx]) {
                    domainNodes[idx].mesh.scale.setScalar(1.6);
                    cyanKeyLight.intensity = 4.8;
                }
            });
            chip.addEventListener('mouseleave', () => {
                if (domainNodes[idx]) {
                    domainNodes[idx].mesh.scale.setScalar(1.0);
                    cyanKeyLight.intensity = 3.2;
                }
            });
        });

        // 60FPS Visibility Observer
        const heroSection = document.getElementById('hero');
        let heroVisible = true;
        createObserver(heroSection, () => { heroVisible = true; }, () => { heroVisible = false; });

        // Animation Loop
        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);
            if (!heroVisible) return;

            const elapsed = clock.getElapsedTime();

            // 1. Monolith Gentle Rotation & Pulse
            obeliskMesh.rotation.y = elapsed * 0.22;
            quantumCoreMesh.rotation.x = -elapsed * 0.45;
            quantumCoreMesh.rotation.y = elapsed * 0.6;
            const coreBreathe = 1 + Math.sin(elapsed * 2.5) * 0.09;
            quantumCoreMesh.scale.setScalar(coreBreathe);

            // 2. Orbital Gimbals Counter-Rotation
            let warpSpeedMultiplier = 1;
            if (shockwaveActive) {
                shockwaveProgress += 0.025;
                const wave = Math.sin(shockwaveProgress * Math.PI);
                warpSpeedMultiplier = 1 + wave * 4.5;
                cyanKeyLight.intensity = 3.2 + wave * 5.0;
                particleMat.size = 0.65 + wave * 0.8;
                if (shockwaveProgress >= 1) {
                    shockwaveActive = false;
                    particleMat.size = 0.65;
                }
            }

            orbitalRings.forEach(r => {
                r.mesh.rotation.x += r.speedX * warpSpeedMultiplier;
                r.mesh.rotation.y += r.speedY * warpSpeedMultiplier;
            });

            // 3. Domain Satellites Orbiting
            domainNodes.forEach(d => {
                const currentAngle = d.baseAngle + elapsed * 0.25 * warpSpeedMultiplier;
                d.mesh.position.x = Math.cos(currentAngle) * orbitRadius;
                d.mesh.position.z = Math.sin(currentAngle) * orbitRadius;
                d.mesh.position.y = Math.sin(elapsed * 1.5 + d.baseAngle) * 3.5;
                d.mesh.rotation.x = elapsed * 0.8;
                d.mesh.rotation.y = elapsed * 0.6;
            });

            // 4. Stardust Particles Motion
            particleSystem.rotation.y = elapsed * 0.04;
            particleSystem.rotation.x = Math.sin(elapsed * 0.03) * 0.08;

            // 5. Inertia Damping & Mouse Drag Response
            monolithMasterGroup.rotation.y += rotVelocityY;
            monolithMasterGroup.rotation.x += rotVelocityX;
            rotVelocityX *= 0.93;
            rotVelocityY *= 0.93;

            // Camera Parallax
            const targetCamX = mouse.nx * 5.5;
            const targetCamY = mouse.ny * 3.5;
            camera.position.x = lerp(camera.position.x, targetCamX, 0.04);
            camera.position.y = lerp(camera.position.y, targetCamY, 0.04);

            // Scroll Zoom Choreography
            const scrollY = window.scrollY;
            const scrollProgress = clamp(scrollY / window.innerHeight, 0, 1.4);
            camera.position.z = 42 - scrollProgress * 16;
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
    //  SCENE 02: SKILLS SECTION — 3D CYBER THREAT NETWORK MESH
    // ==========================================================================
    function initCyberMeshScene() {
        const canvas = document.getElementById('cyberCanvas');
        if (!canvas) return;

        const container = canvas.parentElement;
        const width = container.clientWidth || 440;
        const height = container.clientHeight || 420;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
        camera.position.set(0, 0, 18);

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const cyberGroup = new THREE.Group();
        scene.add(cyberGroup);

        // 1. Icosahedron Network Geometry
        const networkGeom = new THREE.IcosahedronGeometry(6.5, 2);
        const positionAttr = networkGeom.attributes.position;
        const vertexCount = positionAttr.count;

        // Vertex Sphere Nodes
        const nodeMatCyan = new THREE.MeshStandardMaterial({
            color: 0x00f0ff,
            emissive: 0x00f0ff,
            emissiveIntensity: 0.8,
            roughness: 0.2
        });
        const nodeMatViolet = new THREE.MeshStandardMaterial({
            color: 0x8b5cf6,
            emissive: 0x8b5cf6,
            emissiveIntensity: 0.8,
            roughness: 0.2
        });

        const nodeSpheres = [];
        for (let i = 0; i < vertexCount; i += 3) {
            const x = positionAttr.getX(i);
            const y = positionAttr.getY(i);
            const z = positionAttr.getZ(i);

            const sphere = new THREE.Mesh(
                new THREE.SphereGeometry(0.22, 8, 8),
                i % 2 === 0 ? nodeMatCyan : nodeMatViolet
            );
            sphere.position.set(x, y, z);
            cyberGroup.add(sphere);
            nodeSpheres.push(sphere);
        }

        // Connecting Network Filaments
        const wireframeGeom = new THREE.WireframeGeometry(networkGeom);
        const wireframeMat = new THREE.LineBasicMaterial({
            color: 0x00f0ff,
            transparent: true,
            opacity: 0.35,
            blending: THREE.AdditiveBlending
        });
        const wireframeLines = new THREE.LineSegments(wireframeGeom, wireframeMat);
        cyberGroup.add(wireframeLines);

        // Core Glowing Threat Center
        const centerGlow = new THREE.Mesh(
            new THREE.SphereGeometry(2.4, 16, 16),
            new THREE.MeshBasicMaterial({
                color: 0x8b5cf6,
                wireframe: true,
                transparent: true,
                opacity: 0.4
            })
        );
        cyberGroup.add(centerGlow);

        // Lighting
        const lightKey = new THREE.PointLight(0x00f0ff, 2.5, 40);
        lightKey.position.set(10, 10, 10);
        scene.add(lightKey);

        const lightFill = new THREE.PointLight(0x8b5cf6, 2.2, 40);
        lightFill.position.set(-10, -10, -10);
        scene.add(lightFill);

        // Mouse Drag Interaction on Cyber Mesh
        let isDragging = false;
        let prevX = 0, prevY = 0;
        let vX = 0, vY = 0;

        canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            prevX = e.clientX;
            prevY = e.clientY;
        });

        window.addEventListener('mouseup', () => { isDragging = false; });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - prevX;
            const dy = e.clientY - prevY;
            vY += dx * 0.005;
            vX += dy * 0.005;
            prevX = e.clientX;
            prevY = e.clientY;
        });

        // Visibility Observer
        let cyberVisible = true;
        createObserver(canvas, () => { cyberVisible = true; }, () => { cyberVisible = false; });

        function animateCyber() {
            requestAnimationFrame(animateCyber);
            if (!cyberVisible) return;

            cyberGroup.rotation.y += 0.006 + vY;
            cyberGroup.rotation.x += 0.004 + vX;
            vX *= 0.92;
            vY *= 0.92;

            centerGlow.rotation.y -= 0.012;
            centerGlow.rotation.x += 0.008;

            renderer.render(scene, camera);
        }
        animateCyber();

        window.addEventListener('resize', () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            if (w && h) {
                camera.aspect = w / h;
                camera.updateProjectionMatrix();
                renderer.setSize(w, h);
            }
        }, { passive: true });
    }

    // ==========================================================================
    //  SCENE 03: 3D SPECIMEN VAULT CAPSULE (SAFFRON 3D LAB MODAL)
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

        const capsuleGroup = new THREE.Group();
        scene.add(capsuleGroup);

        // Crystal Outer Glass Shell
        const glassGeom = new THREE.CylinderGeometry(2.4, 2.4, 6.2, 32, 1, true);
        const glassMat = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.35,
            roughness: 0.05,
            metalness: 0.1,
            transmission: 0.85,
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

        // Suspended Saffron Strands Inside
        const strandGroup = new THREE.Group();
        capsuleGroup.add(strandGroup);

        const count = 75;
        for (let i = 0; i < count; i++) {
            const curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3((Math.random() - 0.5) * 1.5, -2.5 + Math.random() * 0.8, (Math.random() - 0.5) * 1.5),
                new THREE.Vector3((Math.random() - 0.5) * 2.0, (Math.random() - 0.5) * 2.0, (Math.random() - 0.5) * 2.0),
                new THREE.Vector3((Math.random() - 0.5) * 1.6, 2.5 - Math.random() * 0.8, (Math.random() - 0.5) * 1.6)
            ]);
            const strandGeom = new THREE.TubeGeometry(curve, 16, 0.04, 6, false);
            const strandMat = new THREE.MeshStandardMaterial({
                color: 0xff2a5f,
                emissive: 0xff2a5f,
                emissiveIntensity: 0.6,
                roughness: 0.3
            });
            const strandMesh = new THREE.Mesh(strandGeom, strandMat);
            strandGroup.add(strandMesh);
        }

        // Lights
        const lightA = new THREE.PointLight(0xf5b82e, 2.5, 30);
        lightA.position.set(6, 6, 8);
        scene.add(lightA);

        const lightB = new THREE.PointLight(0xff2a5f, 2.2, 30);
        lightB.position.set(-6, -4, 6);
        scene.add(lightB);

        // Drag to rotate
        let isDragging = false;
        let prevX = 0, prevY = 0;
        let vX = 0, vY = 0;

        canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            prevX = e.clientX;
            prevY = e.clientY;
        });

        window.addEventListener('mouseup', () => { isDragging = false; });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - prevX;
            const dy = e.clientY - prevY;
            vY += dx * 0.005;
            vX += dy * 0.005;
            prevX = e.clientX;
            prevY = e.clientY;
        });

        function animateVault() {
            requestAnimationFrame(animateVault);
            capsuleGroup.rotation.y += 0.008 + vY;
            capsuleGroup.rotation.x += vX;
            vX *= 0.92;
            vY *= 0.92;
            strandGroup.rotation.y -= 0.004;
            renderer.render(scene, camera);
        }
        animateVault();

        window.addEventListener('resize', () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            if (w && h) {
                camera.aspect = w / h;
                camera.updateProjectionMatrix();
                renderer.setSize(w, h);
            }
        }, { passive: true });
    }

    // ==========================================================================
    //  SCENE 04: FLUID INFUSION SIMULATOR (CANVAS)
    // ==========================================================================
    function initInfusionSimulator() {
        const canvas = document.getElementById('infusionCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const triggerBtn = document.getElementById('triggerInfusionBtn');
        const statusText = document.getElementById('infusionStatusText');

        function resize() {
            if (canvas.parentElement) {
                canvas.width = canvas.parentElement.clientWidth || 480;
                canvas.height = canvas.parentElement.clientHeight || 240;
            }
        }
        resize();
        window.addEventListener('resize', resize, { passive: true });

        let particles = [];
        let strands = [];
        let isInfusing = false;
        let ambientGold = 0;

        class SaffronStrand {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.len = 35 + Math.random() * 20;
                this.angle = Math.random() * Math.PI;
                this.vy = 0.8 + Math.random() * 0.5;
            }
            update() {
                this.y += this.vy;
                this.angle += 0.02;
                if (this.y > canvas.height * 0.7) this.vy *= 0.97;
            }
            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);
                ctx.strokeStyle = '#ff2a5f';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(-this.len / 2, 0);
                ctx.quadraticCurveTo(0, 6, this.len / 2, 0);
                ctx.stroke();
                ctx.restore();
            }
        }

        class DyeParticle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.vx = (Math.random() - 0.5) * 2;
                this.vy = (Math.random() - 0.5) * 1.6;
                this.rad = 2 + Math.random() * 4;
                this.alpha = 0.8;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.vx *= 0.98;
                this.vy *= 0.98;
                this.rad += 0.06;
                this.alpha -= 0.005;
            }
            draw() {
                if (this.alpha <= 0) return;
                ctx.save();
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.rad, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(245, 184, 46, ${this.alpha * 0.6})`;
                ctx.fill();
                ctx.restore();
            }
        }

        function infuse() {
            if (isInfusing) return;
            isInfusing = true;
            if (statusText) statusText.textContent = 'INFUSION IN PROGRESS: CROCIN BLOOMING AT 65°C...';
            if (window.soundFX) window.soundFX.playInfuse();

            for (let i = 0; i < 4; i++) {
                setTimeout(() => {
                    strands.push(new SaffronStrand(canvas.width * 0.25 + (i / 4) * (canvas.width * 0.5), 15));
                }, i * 250);
            }

            const timer = setInterval(() => {
                strands.forEach(s => {
                    for (let p = 0; p < 5; p++) {
                        particles.push(new DyeParticle(s.x + (Math.random() - 0.5) * 20, s.y));
                    }
                });
                ambientGold = Math.min(ambientGold + 0.02, 0.8);
            }, 60);

            setTimeout(() => {
                clearInterval(timer);
                if (statusText) statusText.textContent = 'INFUSION COMPLETE: AUTHENTIC LIQUID GOLD (CRO = 264.8)';
                setTimeout(() => { isInfusing = false; }, 2000);
            }, 6000);
        }

        if (triggerBtn) triggerBtn.addEventListener('click', infuse);

        function render() {
            requestAnimationFrame(render);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (ambientGold > 0) {
                const bgGrad = ctx.createRadialGradient(
                    canvas.width / 2, canvas.height / 2, 10,
                    canvas.width / 2, canvas.height / 2, canvas.width / 2
                );
                bgGrad.addColorStop(0, `rgba(245, 184, 46, ${ambientGold * 0.45})`);
                bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = bgGrad;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            particles = particles.filter(p => p.alpha > 0);
            particles.forEach(p => { p.update(); p.draw(); });
            strands.forEach(s => { s.update(); s.draw(); });
        }
        render();
    }

    // ==========================================================================
    //  ENGINE BOOTSTRAP
    // ==========================================================================
    function bootEngine() {
        initHeroScene();
        initCyberMeshScene();
        initVaultScene();
        initInfusionSimulator();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootEngine);
    } else {
        bootEngine();
    }

})();
