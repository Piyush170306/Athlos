'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import Link from 'next/link';

interface CinematicEarthHeroProps {
  onExploreClick?: () => void;
}

export default function CinematicEarthHero({ onExploreClick }: CinematicEarthHeroProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const flowCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Flowing Gold Light Atmosphere on the Left Side
  useEffect(() => {
    const canvas = flowCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    // Floating golden stardust particles on the left
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * (canvas.width * 0.65),
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 0.8,
      vx: Math.random() * 0.35 + 0.1,
      vy: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.5 + 0.2,
      color: Math.random() > 0.4 ? '#E3C276' : '#C6A45A',
    }));

    const renderFlow = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.008;

      const w = canvas.width;
      const h = canvas.height;

      // Draw subtle undulating flowing gold light waves on the left
      const waveCount = 3;
      for (let i = 0; i < waveCount; i++) {
        ctx.save();
        ctx.beginPath();
        const baseAlpha = 0.06 + i * 0.03;
        const grad = ctx.createLinearGradient(0, 0, w * 0.6, h);
        grad.addColorStop(0, `rgba(227, 194, 118, 0)`);
        grad.addColorStop(0.3, `rgba(198, 164, 90, ${baseAlpha})`);
        grad.addColorStop(0.7, `rgba(73, 53, 30, ${baseAlpha * 1.5})`);
        grad.addColorStop(1, `rgba(8, 7, 6, 0)`);

        ctx.fillStyle = grad;
        ctx.strokeStyle = `rgba(227, 194, 118, ${0.12 + i * 0.05})`;
        ctx.lineWidth = 1.5;

        ctx.moveTo(0, h * 0.3 + i * 60);
        for (let x = 0; x <= w * 0.65; x += 30) {
          const waveY =
            h * 0.45 +
            Math.sin(x * 0.004 + time + i * 1.5) * 45 +
            Math.cos(x * 0.002 - time * 0.8) * 35 +
            i * 70;
          ctx.lineTo(x, waveY);
        }
        ctx.lineTo(w * 0.65, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // Draw drifting golden stardust particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x > w * 0.65) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.save();
        ctx.globalAlpha = p.alpha * (0.6 + Math.sin(time * 2 + p.x) * 0.4);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(renderFlow);
    };

    renderFlow();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // 2. Main Three.js Scene: Illuminated Earth + Physical 3D Typography Ring
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // A. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080706, 0.035);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 780;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 9.8);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // B. Lighting Setup
    // Key Sun Light: Golden sun rays from top-right kissing the Earth's curvature
    const sunLight = new THREE.DirectionalLight(0xfff6dd, 3.6);
    sunLight.position.set(9, 4, 6.5);
    scene.add(sunLight);

    // Atmospheric Blue-White Rim Light: Replicating the thin horizon glow in reference image 1
    const atmosphericRimLight = new THREE.DirectionalLight(0x7dc4ff, 2.8);
    atmosphericRimLight.position.set(-2, 3, -7);
    scene.add(atmosphericRimLight);

    // Deep Bronze Ambient Light: Blending shadows into the ATHLOS deep brown-gold theme
    const ambientLight = new THREE.AmbientLight(0x21180f, 0.85);
    scene.add(ambientLight);

    // C. Deep Cosmic Starfield (Restrained, elegant, non-intrusive)
    const starCount = 300;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const starPalette = [
      new THREE.Color(0xe3c276),
      new THREE.Color(0xc6a45a),
      new THREE.Color(0xf5ebd4),
      new THREE.Color(0xffffff),
    ];

    for (let i = 0; i < starCount; i++) {
      const idx = i * 3;
      starPos[idx] = (Math.random() - 0.5) * 50;
      starPos[idx + 1] = (Math.random() - 0.5) * 35;
      starPos[idx + 2] = (Math.random() - 0.5) * 25 - 8;

      const col = starPalette[Math.floor(Math.random() * starPalette.length)];
      starColors[idx] = col.r;
      starColors[idx + 1] = col.g;
      starColors[idx + 2] = col.b;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // D. The Earth Hierarchy & Responsive Positioning
    // Earth Radius 3.55 units.
    // On Desktop: Center is at x = 5.2, meaning the sphere spans from x = 1.65 to 8.75.
    // The screen right edge is ~6.4, so ~45% of the globe extends off-screen to the right!
    const earthGroup = new THREE.Group();

    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;

    const updateEarthPosition = (w: number) => {
      if (w < 768) {
        // Mobile: Centered lower-right so user can see the orbit and Earth without breaking text
        earthGroup.position.set(2.0, -1.8, -1.8);
        earthGroup.scale.set(0.68, 0.68, 0.68);
      } else if (w < 1024) {
        // Tablet: Shifted right
        earthGroup.position.set(4.0, -0.1, -0.6);
        earthGroup.scale.set(0.85, 0.85, 0.85);
      } else {
        // Desktop: Occupying ~35-40% on the right, half-globe visible, extending off-screen!
        earthGroup.position.set(5.2, -0.15, 0);
        earthGroup.scale.set(1.02, 1.02, 1.02);
      }
    };
    updateEarthPosition(width);

    // E. Load Earth Textures & Build Spherical Surface
    const textureLoader = new THREE.TextureLoader();

    // Fallback procedural night texture if texture load delays
    const createFallbackEarthTexture = () => {
      const c = document.createElement('canvas');
      c.width = 1024;
      c.height = 512;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#0a0d14'; // deep ocean
      ctx.fillRect(0, 0, 1024, 512);

      // Continent silhouettes
      ctx.fillStyle = '#171922';
      for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 1024, Math.random() * 512, Math.random() * 90 + 30, 0, Math.PI * 2);
        ctx.fill();
      }

      // Golden city lights
      ctx.fillStyle = '#ffcf5c';
      for (let i = 0; i < 600; i++) {
        ctx.fillRect(Math.random() * 1024, Math.random() * 512, Math.random() * 2 + 1, Math.random() * 2 + 1);
      }
      return new THREE.CanvasTexture(c);
    };

    const fallbackTexture = createFallbackEarthTexture();

    const earthGeo = new THREE.SphereGeometry(3.55, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: fallbackTexture,
      roughness: 0.4,
      metalness: 0.12,
    });
    const earthSphere = new THREE.Mesh(earthGeo, earthMat);
    // Earth axial tilt (~23.5 degrees)
    earthSphere.rotation.z = -0.41;
    earthGroup.add(earthSphere);

    // Load authentic NASA 2048x1024 textures downloaded in public assets
    textureLoader.load(
      '/assets/branding/earth_atmos_2048.jpg',
      (surfaceTex) => {
        surfaceTex.colorSpace = THREE.SRGBColorSpace;
        earthMat.map = surfaceTex;
        earthMat.needsUpdate = true;
      },
      undefined,
      (err) => console.warn('Earth surface texture fallback used:', err)
    );

    textureLoader.load(
      '/assets/branding/earth_lights_2048.png',
      (lightsTex) => {
        lightsTex.colorSpace = THREE.SRGBColorSpace;
        earthMat.emissiveMap = lightsTex;
        earthMat.emissive = new THREE.Color(0xffbf47); // Radiant golden city lights from references
        earthMat.emissiveIntensity = 2.6;
        earthMat.needsUpdate = true;
      },
      undefined,
      (err) => console.warn('Earth lights texture fallback used:', err)
    );

    textureLoader.load(
      '/assets/branding/earth_normal_2048.jpg',
      (normalTex) => {
        earthMat.normalMap = normalTex;
        earthMat.normalScale = new THREE.Vector2(0.85, 0.85);
        earthMat.needsUpdate = true;
      },
      undefined,
      (err) => console.warn('Earth normal texture fallback used:', err)
    );

    // F. The Ethereal Blue-White Atmospheric Horizon Rim (From Reference Images 1 & 2)
    // Custom Fresnel Shader for razor-sharp, photorealistic atmospheric glow
    const atmosphereVertexShader = `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const atmosphereFragmentShader = `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vec3 viewDir = normalize(-vPosition);
        float dotProduct = max(dot(vNormal, viewDir), 0.0);
        float fresnel = pow(1.0 - dotProduct, 3.4);
        
        // Ethereal cyan/blue-white atmosphere blending into warm gold sunset fringe
        vec3 blueWhiteRim = vec3(0.38, 0.74, 1.0);
        vec3 goldenGaze = vec3(0.95, 0.82, 0.52);
        vec3 finalColor = mix(blueWhiteRim, goldenGaze, 0.22);
        
        gl_FragColor = vec4(finalColor, fresnel * 0.95);
      }
    `;

    const atmosphereGeo = new THREE.SphereGeometry(3.61, 64, 64);
    const atmosphereMat = new THREE.ShaderMaterial({
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    earthGroup.add(atmosphereMesh);

    // Outer soft volumetric haze
    const outerHazeGeo = new THREE.SphereGeometry(3.72, 32, 32);
    const outerHazeMat = new THREE.MeshBasicMaterial({
      color: 0x4aa3ff,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const outerHazeMesh = new THREE.Mesh(outerHazeGeo, outerHazeMat);
    earthGroup.add(outerHazeMesh);

    scene.add(earthGroup);

    // G. The Physical 3D Typography Ring (ATHLOS WAR OF BATCHES 2026-27)
    // The letters themselves form the physical orbital structure!
    const ringParent = new THREE.Group();
    // Dramatic inclination crossing the Earth's hemisphere
    const baseTiltX = 0.54;
    const baseTiltY = 0.22;
    const baseTiltZ = -0.32;
    ringParent.rotation.set(baseTiltX, baseTiltY, baseTiltZ);
    earthGroup.add(ringParent);

    const goldRingMaterial = new THREE.MeshStandardMaterial({
      color: 0xffe29a, // Metallic champagne gold
      metalness: 0.95,
      roughness: 0.16,
    });

    let ringRotGroup: THREE.Group | null = null;

    const fontLoader = new FontLoader();
    fontLoader.load(
      '/assets/fonts/helvetiker_bold.typeface.json',
      (font) => {
        ringRotGroup = new THREE.Group();
        ringParent.add(ringRotGroup);

        // Exact text required by the user: "ATHLOS WAR OF BATCHES 2026-27"
        const phrase = 'ATHLOS WAR OF BATCHES 2026-27';
        // 2 complete repetitions around the 360-degree orbit with star diamond spacers
        const fullLoop = `${phrase}   ✦   ${phrase}   ✦   `;
        const characters = Array.from(fullLoop);
        const totalChars = characters.length;
        const orbitRadius = 5.35; // Larger than Earth (radius 3.55) to cross dramatically
        const angleStep = (Math.PI * 2) / totalChars;

        characters.forEach((char, i) => {
          if (char === ' ') return; // Skip whitespace

          const angle = i * angleStep;

          // Extruded 3D Text Geometry with bold depth and bevel
          const letterGeo = new TextGeometry(char, {
            font: font,
            size: 0.38,
            depth: 0.14,
            curveSegments: 5,
            bevelEnabled: true,
            bevelThickness: 0.025,
            bevelSize: 0.015,
            bevelOffset: 0,
            bevelSegments: 2,
          });

          letterGeo.computeBoundingBox();
          const bb = letterGeo.boundingBox!;
          const charW = bb.max.x - bb.min.x;
          const charH = bb.max.y - bb.min.y;

          // Center letter on its local origin
          letterGeo.translate(-charW / 2, -charH / 2, -0.07);

          const letterMesh = new THREE.Mesh(letterGeo, goldRingMaterial);

          // Position letter along the circular orbit
          letterMesh.position.x = orbitRadius * Math.cos(angle);
          letterMesh.position.z = orbitRadius * Math.sin(angle);
          letterMesh.position.y = 0;

          // Tangent orientation: letter faces radially outward, following the curve
          letterMesh.rotation.y = -angle + Math.PI / 2;

          ringRotGroup!.add(letterMesh);
        });

        setIsLoaded(true);
      },
      undefined,
      (err) => {
        console.warn('Font loading failed:', err);
        setIsLoaded(true);
      }
    );

    // H. Cursor Interaction & Mouse Parallax
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

    // I. Window Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || window.innerWidth;
      const newH = container.clientHeight || 780;

      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);

      updateEarthPosition(newW);
    };
    window.addEventListener('resize', handleResize);

    // J. Main 60fps Animation Loop
    let animId: number;
    let isVisible = true;

    const handleVisibility = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isVisible) return;

      // Mouse lerp with smooth inertia
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      if (!prefersReducedMotion) {
        // Subtle camera parallax
        camera.position.x = mouseX * 0.45;
        camera.position.y = -mouseY * 0.3;
        camera.lookAt(0, 0, 0);

        // Independent slow Earth rotation around its axis
        earthSphere.rotation.y += 0.0012;

        // Continuous left-to-right traveling motion of the 3D typography ring
        if (ringRotGroup) {
          ringRotGroup.rotation.y += 0.0055;
        }

        // Interactive 3D tilt of the typography ring in response to cursor
        ringParent.rotation.x = baseTiltX + mouseY * 0.12;
        ringParent.rotation.z = baseTiltZ + mouseX * 0.14;

        // Subtle stellar background drift
        stars.rotation.y += 0.0002;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      cancelAnimationFrame(animId);

      renderer.dispose();
      starGeo.dispose();
      starMat.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      atmosphereGeo.dispose();
      atmosphereMat.dispose();
      outerHazeGeo.dispose();
      outerHazeMat.dispose();
      fallbackTexture.dispose();

      if (container && renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <section className="relative w-full overflow-hidden min-h-[660px] sm:min-h-[740px] lg:min-h-[820px] flex items-center justify-center bg-[#080706] select-none">
      {/* 1. Left-Side Flowing Golden Light Atmosphere Canvas */}
      <canvas
        ref={flowCanvasRef}
        className="pointer-events-none absolute inset-0 z-0 w-full h-full"
        aria-hidden="true"
      />

      {/* 2. 3D WebGL Canvas Layer (Earth + Typographic Orbit) */}
      <div
        ref={containerRef}
        className="absolute inset-0 z-10 pointer-events-none"
        aria-hidden="true"
      />

      {/* 3. Subtle Atmospheric Vignette & Contrast Gradients */}
      <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-[#080706] via-transparent to-[#080706]/75" />
      <div className="absolute inset-0 z-20 pointer-events-none bg-[radial-gradient(ellipse_at_30%_50%,_rgba(33,24,15,0.45)_0%,_transparent_70%)]" />

      {/* 4. Foreground Hero Content Container */}
      <div className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col justify-center min-h-[620px]">
        {/* Left-Side Dominant Title Hierarchy */}
        <div className="max-w-2xl text-left space-y-4 sm:space-y-5">
          {/* Subtle Season Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#100D09]/90 border border-[#C6A45A]/40 text-[#E3C276] text-[11px] font-spartan font-black uppercase tracking-[0.3em] backdrop-blur-md shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E3C276] animate-pulse" />
            <span>2026 — 2027</span>
          </div>

          {/* Title Composition:
              ATHLOS appears first.
              WAR OF BATCHES appears immediately below it.
              WAR OF BATCHES MUST have a larger font size than ATHLOS!
              Both use premium gold typography.
              League Spartan typeface.
          */}
          <div className="space-y-1">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-spartan font-black uppercase tracking-[0.16em] text-[#C6A45A] leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
              ATHLOS
            </h2>
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] xl:text-[8.5rem] font-spartan font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#FFF5D6] via-[#E3C276] via-[#C6A45A] to-[#8C6B2D] drop-shadow-[0_12px_45px_rgba(227,194,118,0.45)] leading-[0.9]">
              WAR OF BATCHES
            </h1>
          </div>

          {/* Interactive Navigation Actions */}
          <div className="pt-3 flex flex-wrap items-center gap-3.5">
            <button
              onClick={() => {
                const el = document.getElementById('leaderboard-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                if (onExploreClick) onExploreClick();
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#21180F] via-[#2A1F13] to-[#100D09] border border-[#C6A45A]/70 hover:border-[#E3C276] text-[#E3C276] text-xs font-spartan font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-[0_4px_25px_rgba(227,194,118,0.25)] hover:shadow-[0_6px_35px_rgba(227,194,118,0.4)] hover:scale-[1.02]"
            >
              Explore Standings
            </button>

            <Link
              href="/matches"
              className="px-6 py-3 rounded-xl bg-[#100D09]/80 border border-[#49351E] hover:border-[#C6A45A] text-[#F5EBD4]/90 hover:text-white text-xs font-spartan font-bold uppercase tracking-[0.2em] transition-all duration-300 hover:scale-[1.02]"
            >
              Tournament Fixtures
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
