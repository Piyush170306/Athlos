'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

interface CosmicPlanetaryHeroProps {
  onExploreClick?: () => void;
}

export default function CosmicPlanetaryHero({ onExploreClick }: CosmicPlanetaryHeroProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080808, 0.04);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 750;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 11);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 2. Lighting Setup
    // Key Sun Light (Warm gold from top right)
    const sunLight = new THREE.DirectionalLight(0xfff3db, 3.2);
    sunLight.position.set(7, 5, 6);
    scene.add(sunLight);

    // Secondary Fill Light (Subtle bronze from bottom left)
    const fillLight = new THREE.DirectionalLight(0xc6a45a, 1.4);
    fillLight.position.set(-6, -4, 4);
    scene.add(fillLight);

    // Subtle Rim Light (Cool/warm highlight from back)
    const rimLight = new THREE.DirectionalLight(0xe6ca83, 1.8);
    rimLight.position.set(0, 6, -8);
    scene.add(rimLight);

    // Ambient Space Light
    const ambientLight = new THREE.AmbientLight(0x211a10, 0.9);
    scene.add(ambientLight);

    // 3. Deep Space Stellar Particle Field
    const starCount = 350;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const goldPalette = [
      new THREE.Color(0xe6ca83),
      new THREE.Color(0xc6a45a),
      new THREE.Color(0xf5ebd4),
      new THREE.Color(0xffffff),
    ];

    for (let i = 0; i < starCount; i++) {
      const idx = i * 3;
      starPositions[idx] = (Math.random() - 0.5) * 45;
      starPositions[idx + 1] = (Math.random() - 0.5) * 35;
      starPositions[idx + 2] = (Math.random() - 0.5) * 30 - 5;

      const col = goldPalette[Math.floor(Math.random() * goldPalette.length)];
      starColors[idx] = col.r;
      starColors[idx + 1] = col.g;
      starColors[idx + 2] = col.b;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // 4. Procedural Textures for Radiant Metallic Planetary Surfaces
    const createPlanetTexture = (type: 'athlos' | 'wob') => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;

      // Base gradient
      const grad = ctx.createLinearGradient(0, 0, 1024, 512);
      if (type === 'athlos') {
        // Radiant metallic champagne & gold
        grad.addColorStop(0, '#17140e');
        grad.addColorStop(0.2, '#302719');
        grad.addColorStop(0.4, '#c6a45a');
        grad.addColorStop(0.65, '#e6ca83');
        grad.addColorStop(0.85, '#6b4f1d');
        grad.addColorStop(1, '#17140e');
      } else {
        // Deep obsidian, bronze & crimson highlights
        grad.addColorStop(0, '#0c0a08');
        grad.addColorStop(0.25, '#211a10');
        grad.addColorStop(0.5, '#4a1f18');
        grad.addColorStop(0.7, '#8f382a');
        grad.addColorStop(0.85, '#c6a45a');
        grad.addColorStop(1, '#0c0a08');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 512);

      // Swirling atmospheric bands
      ctx.lineWidth = 14;
      for (let y = 30; y < 512; y += 45) {
        ctx.beginPath();
        ctx.strokeStyle =
          type === 'athlos'
            ? `rgba(230, 202, 131, ${0.15 + Math.random() * 0.2})`
            : `rgba(198, 164, 90, ${0.15 + Math.random() * 0.25})`;
        ctx.moveTo(0, y);
        for (let x = 0; x <= 1024; x += 60) {
          ctx.lineTo(x, y + Math.sin(x * 0.015) * 16);
        }
        ctx.stroke();
      }

      // Molten speckle / metallic crystalline noise
      for (let i = 0; i < 400; i++) {
        const px = Math.random() * 1024;
        const py = Math.random() * 512;
        const pr = Math.random() * 2.5 + 0.5;
        ctx.fillStyle =
          type === 'athlos'
            ? 'rgba(255, 245, 214, 0.4)'
            : 'rgba(230, 202, 131, 0.35)';
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      return texture;
    };

    const athlosTexture = createPlanetTexture('athlos');
    const wobTexture = createPlanetTexture('wob');

    // 5. Build Planet 1 (RIGHT: ATHLOS)
    // Sphere Radius 1.95, positioned on the right half
    const athlosPlanetGroup = new THREE.Group();
    // Default desktop position: right side
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;

    if (isMobile) {
      athlosPlanetGroup.position.set(1.2, 1.8, -2.5);
      athlosPlanetGroup.scale.set(0.68, 0.68, 0.68);
    } else if (isTablet) {
      athlosPlanetGroup.position.set(2.4, 0.4, -0.8);
      athlosPlanetGroup.scale.set(0.85, 0.85, 0.85);
    } else {
      athlosPlanetGroup.position.set(3.4, 0.2, 0);
      athlosPlanetGroup.scale.set(1.05, 1.05, 1.05);
    }

    const athlosSphereGeo = new THREE.SphereGeometry(1.9, 64, 64);
    const athlosSphereMat = new THREE.MeshStandardMaterial({
      map: athlosTexture,
      roughness: 0.28,
      metalness: 0.85,
    });
    const athlosSphere = new THREE.Mesh(athlosSphereGeo, athlosSphereMat);
    athlosPlanetGroup.add(athlosSphere);

    // Radiant golden atmospheric glow layer
    const athlosAtmosphereGeo = new THREE.SphereGeometry(1.94, 32, 32);
    const athlosAtmosphereMat = new THREE.MeshBasicMaterial({
      color: 0xe6ca83,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const athlosAtmosphere = new THREE.Mesh(athlosAtmosphereGeo, athlosAtmosphereMat);
    athlosPlanetGroup.add(athlosAtmosphere);

    scene.add(athlosPlanetGroup);

    // 6. Build Planet 2 (LEFT: WAR OF BATCHES 2026–27)
    // Sphere Radius 1.45, positioned on the left side
    const wobPlanetGroup = new THREE.Group();
    if (isMobile) {
      wobPlanetGroup.position.set(-1.4, -2.2, -2.8);
      wobPlanetGroup.scale.set(0.62, 0.62, 0.62);
    } else if (isTablet) {
      wobPlanetGroup.position.set(-2.6, -1.8, -1.2);
      wobPlanetGroup.scale.set(0.8, 0.8, 0.8);
    } else {
      wobPlanetGroup.position.set(-3.2, -1.4, -0.6);
      wobPlanetGroup.scale.set(0.95, 0.95, 0.95);
    }

    const wobSphereGeo = new THREE.SphereGeometry(1.45, 64, 64);
    const wobSphereMat = new THREE.MeshStandardMaterial({
      map: wobTexture,
      roughness: 0.32,
      metalness: 0.88,
    });
    const wobSphere = new THREE.Mesh(wobSphereGeo, wobSphereMat);
    wobPlanetGroup.add(wobSphere);

    // Atmosphere halo
    const wobAtmosphereGeo = new THREE.SphereGeometry(1.48, 32, 32);
    const wobAtmosphereMat = new THREE.MeshBasicMaterial({
      color: 0xc6a45a,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const wobAtmosphere = new THREE.Mesh(wobAtmosphereGeo, wobAtmosphereMat);
    wobPlanetGroup.add(wobAtmosphere);

    scene.add(wobPlanetGroup);

    // 7. Metallic Gold Material for 3D Typographic Rings
    const goldTextMaterial = new THREE.MeshStandardMaterial({
      color: 0xffe29a,
      metalness: 0.95,
      roughness: 0.18,
    });

    const bronzeGoldTextMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5ebd4,
      metalness: 0.92,
      roughness: 0.22,
    });

    // 8. Typographic Rings Creation with True 3D Depth & Occlusion
    let athlosRingGroup: THREE.Group | null = null;
    let wobRingGroup: THREE.Group | null = null;

    const buildRing = (
      phrase: string,
      repeats: number,
      radius: number,
      font: any,
      letterSize: number,
      depth: number,
      material: THREE.Material,
      tiltX: number,
      tiltZ: number
    ) => {
      const ringGroup = new THREE.Group();
      ringGroup.rotation.x = tiltX;
      ringGroup.rotation.z = tiltZ;

      // Construct phrase repeated with luxury spacers
      let fullText = '';
      for (let r = 0; r < repeats; r++) {
        fullText += phrase + '   ✦   ';
      }

      const chars = Array.from(fullText);
      const totalChars = chars.length;
      const angleStep = (Math.PI * 2) / totalChars;

      chars.forEach((char, i) => {
        if (char === ' ') return;

        const angle = i * angleStep;

        const geo = new TextGeometry(char, {
          font: font,
          size: letterSize,
          depth: depth,
          curveSegments: 5,
          bevelEnabled: true,
          bevelThickness: depth * 0.2,
          bevelSize: letterSize * 0.05,
          bevelOffset: 0,
          bevelSegments: 2,
        });

        geo.computeBoundingBox();
        const bb = geo.boundingBox!;
        const charW = bb.max.x - bb.min.x;
        const charH = bb.max.y - bb.min.y;

        // Center each individual letter on its local origin
        geo.translate(-charW / 2, -charH / 2, -depth / 2);

        const mesh = new THREE.Mesh(geo, material);

        // Position along circular orbit
        mesh.position.x = radius * Math.cos(angle);
        mesh.position.z = radius * Math.sin(angle);
        mesh.position.y = 0;

        // Tangent rotation to follow the ring curve outwards
        mesh.rotation.y = -angle + Math.PI / 2;

        ringGroup.add(mesh);
      });

      return ringGroup;
    };

    // Load Three.js Font and Construct Typographic Rings
    const fontLoader = new FontLoader();
    fontLoader.load(
      '/assets/fonts/helvetiker_bold.typeface.json',
      (font) => {
        // ATHLOS Ring around right planet (radius 3.1 encircling planet radius 1.9)
        // Tilts at Saturn inclination
        athlosRingGroup = buildRing(
          'ATHLOS',
          4, // 4 repetitions around circumference
          3.15,
          font,
          0.38,
          0.12,
          goldTextMaterial,
          0.48, // tiltX
          -0.22 // tiltZ
        );
        athlosPlanetGroup.add(athlosRingGroup);

        // WAR OF BATCHES 2026–27 Ring around left planet (radius 2.5 encircling planet radius 1.45)
        wobRingGroup = buildRing(
          'WAR OF BATCHES 2026–27',
          2, // 2 repetitions around circumference
          2.55,
          font,
          0.26,
          0.09,
          bronzeGoldTextMaterial,
          -0.42, // tiltX
          0.28 // tiltZ
        );
        wobPlanetGroup.add(wobRingGroup);

        setIsLoaded(true);
      },
      undefined,
      (err) => {
        console.warn('Font loading fallback:', err);
        setIsLoaded(true);
      }
    );

    // 9. Mouse Parallax Tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      targetMouseX = nx;
      targetMouseY = ny;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 10. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || window.innerWidth;
      const newH = container.clientHeight || 750;

      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);

      const mobile = newW < 768;
      const tablet = newW >= 768 && newW < 1024;

      if (mobile) {
        athlosPlanetGroup.position.set(1.2, 1.8, -2.5);
        athlosPlanetGroup.scale.set(0.68, 0.68, 0.68);
        wobPlanetGroup.position.set(-1.4, -2.2, -2.8);
        wobPlanetGroup.scale.set(0.62, 0.62, 0.62);
      } else if (tablet) {
        athlosPlanetGroup.position.set(2.4, 0.4, -0.8);
        athlosPlanetGroup.scale.set(0.85, 0.85, 0.85);
        wobPlanetGroup.position.set(-2.6, -1.8, -1.2);
        wobPlanetGroup.scale.set(0.8, 0.8, 0.8);
      } else {
        athlosPlanetGroup.position.set(3.4, 0.2, 0);
        athlosPlanetGroup.scale.set(1.05, 1.05, 1.05);
        wobPlanetGroup.position.set(-3.2, -1.4, -0.6);
        wobPlanetGroup.scale.set(0.95, 0.95, 0.95);
      }
    };

    window.addEventListener('resize', handleResize);

    // 11. Main Render Loop with Visibility Optimization
    let animationFrameId: number;
    let isVisible = true;

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      // Mouse lerp
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      if (!prefersReducedMotion) {
        // Camera parallax
        camera.position.x = mouseX * 0.5;
        camera.position.y = -mouseY * 0.35;
        camera.lookAt(0, 0, 0);

        // Independent Planet Rotations
        athlosSphere.rotation.y += 0.0022;
        wobSphere.rotation.y -= 0.0018;

        // Continuous Typographic Orbital Rings Rotation
        if (athlosRingGroup) {
          athlosRingGroup.rotation.y += 0.0065;
        }
        if (wobRingGroup) {
          wobRingGroup.rotation.y -= 0.0048;
        }

        // Slow celestial particle drift
        starField.rotation.y += 0.0003;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);

      // Dispose resources
      renderer.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      athlosSphereGeo.dispose();
      athlosSphereMat.dispose();
      wobSphereGeo.dispose();
      wobSphereMat.dispose();
      athlosTexture.dispose();
      wobTexture.dispose();

      if (container && renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden min-h-[640px] sm:min-h-[720px] lg:min-h-[780px] flex items-center justify-center bg-[#080808]">
      {/* 3D WebGL Canvas Layer */}
      <div
        ref={containerRef}
        className="absolute inset-0 z-0 pointer-events-none"
        aria-hidden="true"
      />

      {/* Subtle Atmospheric Vignette and Deep Contrast Gradients */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-[#080808] via-transparent to-[#080808]/80" />
      <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_45%,_rgba(8,8,8,0.7)_100%)]" />

      {/* Foreground Hero Content Container */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col justify-center min-h-[600px]">
        {/* Left-Side Dominant Title Hierarchy */}
        <div className="max-w-2xl text-left space-y-3 sm:space-y-4">
          {/* Subtle Season Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#17140E]/80 border border-[#C6A45A]/40 text-[#E6CA83] text-[11px] font-spartan font-black uppercase tracking-[0.3em] backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E6CA83] animate-pulse" />
            <span>2026 — 2027</span>
          </div>

          {/* Title Composition:
              ATHLOS above WAR OF BATCHES.
              WAR OF BATCHES MUST have a larger font size than ATHLOS!
              WAR OF BATCHES is the dominant heading.
              League Spartan typeface. Premium gold typography.
          */}
          <div className="space-y-0.5 sm:space-y-1">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-spartan font-black uppercase tracking-[0.18em] text-[#C6A45A] leading-tight">
              ATHLOS
            </h2>
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-spartan font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#FFF5D6] via-[#E6CA83] to-[#A88B42] drop-shadow-[0_10px_35px_rgba(230,202,131,0.4)] leading-[0.92]">
              WAR OF BATCHES
            </h1>
          </div>

          {/* Quick Action Navigation / Jump */}
          <div className="pt-4 flex items-center space-x-4">
            <button
              onClick={() => {
                const el = document.getElementById('leaderboard-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                if (onExploreClick) onExploreClick();
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#211A10] to-[#14110C] border border-[#C6A45A]/60 hover:border-[#E6CA83] text-[#E6CA83] text-xs font-spartan font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-[0_4px_25px_rgba(230,202,131,0.2)] hover:shadow-[0_6px_35px_rgba(230,202,131,0.35)] hover:scale-[1.02]"
            >
              Explore Tournament
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
