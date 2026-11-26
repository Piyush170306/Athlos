'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  const interactiveLayerRef = useRef<HTMLDivElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  // 1. Flowing Midnight Cosmic Light Atmosphere on the Left Side
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

    // Cosmic starlight particles (Ice-Blue, Starlight White, Silver, Deep Atmospheric Blue)
    const particleColors = ['#79C9F2', '#F2F7FC', '#C7D3DF', '#1D5E91'];
    const particles = Array.from({ length: 48 }, () => ({
      x: Math.random() * (canvas.width * 0.65),
      y: Math.random() * canvas.height,
      radius: Math.random() * 2.2 + 0.6,
      vx: Math.random() * 0.32 + 0.08,
      vy: (Math.random() - 0.5) * 0.22,
      alpha: Math.random() * 0.55 + 0.2,
      color: particleColors[Math.floor(Math.random() * particleColors.length)],
    }));

    const renderFlow = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.007;

      const w = canvas.width;
      const h = canvas.height;

      // Draw subtle undulating flowing cosmic light waves on the left
      const waveCount = 3;
      for (let i = 0; i < waveCount; i++) {
        ctx.save();
        ctx.beginPath();
        const baseAlpha = 0.05 + i * 0.025;
        const grad = ctx.createLinearGradient(0, 0, w * 0.65, h);
        grad.addColorStop(0, 'rgba(29, 94, 145, 0)');
        grad.addColorStop(0.3, `rgba(29, 94, 145, ${baseAlpha})`);
        grad.addColorStop(0.7, `rgba(121, 201, 242, ${baseAlpha * 1.5})`);
        grad.addColorStop(1, 'rgba(3, 6, 11, 0)');

        ctx.fillStyle = grad;
        ctx.strokeStyle = `rgba(121, 201, 242, ${0.12 + i * 0.04})`;
        ctx.lineWidth = 1.4;

        ctx.moveTo(0, h * 0.28 + i * 65);
        for (let x = 0; x <= w * 0.65; x += 30) {
          const waveY =
            h * 0.42 +
            Math.sin(x * 0.0035 + time + i * 1.6) * 42 +
            Math.cos(x * 0.002 - time * 0.75) * 32 +
            i * 68;
          ctx.lineTo(x, waveY);
        }
        ctx.lineTo(w * 0.65, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // Draw drifting cosmic starlight particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x > w * 0.65) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.save();
        ctx.globalAlpha = p.alpha * (0.6 + Math.sin(time * 2.2 + p.x) * 0.4);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 9;
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

  // 2. Main Three.js Scene: Illuminated Earth + Physical 3D Silver Typography Ring + Multi-Axis Drag
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // A. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x03060b, 0.028);

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
    renderer.toneMappingExposure = 1.45;
    container.appendChild(renderer.domElement);

    // B. Lighting Setup
    // Key Sun Light: Radiant solar light kissing Earth's curvature (matches Reference Images 1 & 2)
    const sunLight = new THREE.DirectionalLight(0xfffaee, 4.2);
    sunLight.position.set(7.2, 3.2, 5.0);
    scene.add(sunLight);

    // Front-Facing Daylight / Earthshine Fill Light:
    // Natural warm daylight fill that illuminates continents, oceans, and clouds with crisp realism (no murky blue wash)
    const frontFillLight = new THREE.DirectionalLight(0xfff8ee, 2.8);
    frontFillLight.position.set(2.5, 1.5, 7.5);
    scene.add(frontFillLight);

    // Atmospheric Blue-White Rim Light: Razor-sharp horizon rim glow
    const atmosphericRimLight = new THREE.DirectionalLight(0x79c9f2, 3.5);
    atmosphericRimLight.position.set(8.0, 2.5, -2.0);
    scene.add(atmosphericRimLight);

    // Cosmic Midnight Ambient Light (calibrated to preserve deep space blacks while keeping geographical features visible)
    const ambientLight = new THREE.AmbientLight(0x0c1420, 0.85);
    scene.add(ambientLight);

    // Key Top-Front Directional Light directly illuminating the typography ring
    const ringKeyLight = new THREE.DirectionalLight(0xffffff, 4.8);
    ringKeyLight.position.set(3.5, 3.2, 7.0);
    scene.add(ringKeyLight);

    // Luminous Ice-Blue Fill Point Light catching the ring's extruded bevel edges
    const silverRingPointLight = new THREE.PointLight(0xa5d8ff, 4.6, 22);
    silverRingPointLight.position.set(2.8, 1.8, 6.8);
    scene.add(silverRingPointLight);

    // Subtle lower specular kicker light catching bottom bevels
    const ringKickerLight = new THREE.PointLight(0x79c9f2, 3.2, 18);
    ringKickerLight.position.set(5.5, -2.2, 5.8);
    scene.add(ringKickerLight);

    // C. Deep Cosmic Starfield (Deep Space Black with Ice Blue and Starlight White stars)
    const starCount = 340;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const starPalette = [
      new THREE.Color(0x79c9f2), // Ice blue
      new THREE.Color(0xc7d3df), // Metallic silver
      new THREE.Color(0xf2f7fc), // Starlight white
      new THREE.Color(0x1d5e91), // Atmospheric blue
      new THREE.Color(0xe9b96d), // Restrained amber
    ];

    for (let i = 0; i < starCount; i++) {
      const idx = i * 3;
      starPos[idx] = (Math.random() - 0.5) * 55;
      starPos[idx + 1] = (Math.random() - 0.5) * 38;
      starPos[idx + 2] = (Math.random() - 0.5) * 28 - 7;

      const col = starPalette[Math.floor(Math.random() * starPalette.length)];
      starColors[idx] = col.r;
      starColors[idx + 1] = col.g;
      starColors[idx + 2] = col.b;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.11,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // D. The Earth Hierarchy & Responsive Positioning
    // Earth Radius 3.55 units.
    // Desktop: Shifted right (~35-40% of width on right side, right hemisphere extending off-screen)
    const earthGroup = new THREE.Group();

    const updateEarthPosition = (w: number) => {
      if (w < 768) {
        // Mobile: Centered lower-right
        earthGroup.position.set(2.0, -1.8, -1.8);
        earthGroup.scale.set(0.68, 0.68, 0.68);
      } else if (w < 1024) {
        // Tablet: Shifted right
        earthGroup.position.set(4.0, -0.1, -0.6);
        earthGroup.scale.set(0.85, 0.85, 0.85);
      } else {
        // Desktop: Occupying ~35-40% on right, half-globe visible, extending off-screen!
        earthGroup.position.set(5.2, -0.15, 0);
        earthGroup.scale.set(1.02, 1.02, 1.02);
      }
    };
    updateEarthPosition(width);

    // E. Load Earth Textures & Build Spherical Surface
    const textureLoader = new THREE.TextureLoader();

    // High quality procedural night texture with amber city networks
    const createProceduralEarthTexture = () => {
      const c = document.createElement('canvas');
      c.width = 1024;
      c.height = 512;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#050B16'; // Deep ocean midnight navy
      ctx.fillRect(0, 0, 1024, 512);

      // Continent silhouettes
      ctx.fillStyle = '#0B1727';
      for (let i = 0; i < 48; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 1024, Math.random() * 512, Math.random() * 95 + 30, 0, Math.PI * 2);
        ctx.fill();
      }

      // Restrained amber city lights network (#E9B96D)
      ctx.fillStyle = '#e9b96d';
      for (let i = 0; i < 750; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        ctx.fillRect(x, y, Math.random() * 2 + 1, Math.random() * 2 + 1);
        // Cluster glow
        if (Math.random() > 0.85) {
          ctx.fillStyle = 'rgba(233, 185, 109, 0.4)';
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#e9b96d';
        }
      }
      return new THREE.CanvasTexture(c);
    };

    const fallbackTexture = createProceduralEarthTexture();

    const earthGeo = new THREE.SphereGeometry(3.55, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: fallbackTexture,
      roughness: 0.42,
      metalness: 0.10,
    });
    const earthSphere = new THREE.Mesh(earthGeo, earthMat);
    // Earth axial tilt (~23.5 degrees) & calibrated starting rotation
    // Rotation Y calibrated (2.45 rad) to bring Europe, Africa, Mediterranean, and Asian continents
    // with glowing golden city networks directly onto the visible front-left hemisphere
    earthSphere.rotation.z = -0.41;
    earthSphere.rotation.y = 2.45;
    earthGroup.add(earthSphere);

    // Realistic Clouds Layer (Subtle, rotating independently for depth)
    const createCloudTexture = () => {
      const c = document.createElement('canvas');
      c.width = 1024;
      c.height = 512;
      const ctx = c.getContext('2d')!;
      ctx.clearRect(0, 0, 1024, 512);
      ctx.fillStyle = 'rgba(242, 247, 252, 0.35)';
      for (let i = 0; i < 60; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        const r = Math.random() * 70 + 20;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, 'rgba(242, 247, 252, 0.4)');
        grad.addColorStop(0.5, 'rgba(199, 211, 223, 0.2)');
        grad.addColorStop(1, 'rgba(199, 211, 223, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      return new THREE.CanvasTexture(c);
    };

    const cloudTex = createCloudTexture();
    const cloudGeo = new THREE.SphereGeometry(3.57, 64, 64);
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudTex,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      roughness: 0.9,
    });
    const cloudSphere = new THREE.Mesh(cloudGeo, cloudMat);
    cloudSphere.rotation.z = -0.38;
    cloudSphere.rotation.y = 2.30;
    earthGroup.add(cloudSphere);

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
        earthMat.emissive = new THREE.Color(0xf6c56f); // Brilliant golden amber city lights (#F6C56F) matching Reference 1 & 2
        earthMat.emissiveIntensity = 3.6; // Radiant, luminous city lights
        earthMat.needsUpdate = true;
      },
      undefined,
      (err) => console.warn('Earth lights texture fallback used:', err)
    );

    textureLoader.load(
      '/assets/branding/earth_normal_2048.jpg',
      (normalTex) => {
        earthMat.normalMap = normalTex;
        earthMat.normalScale = new THREE.Vector2(1.2, 1.2);
        earthMat.needsUpdate = true;
      },
      undefined,
      (err) => console.warn('Earth normal texture fallback used:', err)
    );

    // F. Photorealistic Blue-White Atmospheric Horizon Rim (From Reference Images 1 & 2)
    // Custom Fresnel Shader for razor-sharp, cinematic atmospheric limb glow concentrated strictly along the curvature edge
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
        // Fresnel concentrated sharply at the glancing rim (Reference Images 1 & 2)
        float fresnel = pow(1.0 - dotProduct, 2.8);
        
        // Brilliant electric-blue rim blending into bright starlight-white crest
        vec3 deepBlue = vec3(0.08, 0.32, 0.54);      // Deep atmospheric blue
        vec3 electricRim = vec3(0.47, 0.79, 0.95);   // #79C9F2 ice blue
        vec3 whiteCrest = vec3(0.96, 0.98, 1.0);     // #F2F7FC starlight white
        
        vec3 rimCol = mix(deepBlue, electricRim, smoothstep(0.0, 0.7, fresnel));
        rimCol = mix(rimCol, whiteCrest, pow(fresnel, 2.5));
        
        // Concentrated along horizon limb, falling off completely over visible front surface
        // Eliminates any flat murky blue wash
        float alpha = pow(fresnel, 1.8) * 0.95;
        
        gl_FragColor = vec4(rimCol, alpha);
      }
    `;

    const atmosphereGeo = new THREE.SphereGeometry(3.60, 64, 64);
    const atmosphereMat = new THREE.ShaderMaterial({
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    earthGroup.add(atmosphereMesh);

    scene.add(earthGroup);

    // G. The Physical 3D Typography Ring (ATHLOS WAR OF BATCHES 2026-27)
    // Premium Metallic Silver with Ice-Blue Reflections, Enlarge Size by 35-45%
    const ringParent = new THREE.Group();
    const baseTiltX = 0.54;
    const baseTiltY = 0.22;
    const baseTiltZ = -0.32;
    ringParent.rotation.set(baseTiltX, baseTiltY, baseTiltZ);
    earthGroup.add(ringParent);

    // Material: Premium Luminous Metallic Silver / Ice-Blue with bright white highlights
    // Calibrated metalness (0.58), high specular gloss, and luminous ice-blue emissive radiance
    // ensures the letters radiate bright highlights and never appear dark against space or Earth
    const silverRingMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f9ff,
      metalness: 0.58,
      roughness: 0.12,
      emissive: 0x5a8bb8,
      emissiveIntensity: 0.42,
    });

    let ringRotGroup: THREE.Group | null = null;

    const fontLoader = new FontLoader();
    fontLoader.load(
      '/assets/fonts/helvetiker_bold.typeface.json',
      (font) => {
        ringRotGroup = new THREE.Group();
        ringParent.add(ringRotGroup);

        // Exact text required by the user: "ATHLOS WAR OF BATCHES 2026-27"
        // Strictly NO unsupported symbols (e.g. no unicode characters that trigger fallback '?')
        const phrase = 'ATHLOS WAR OF BATCHES 2026-27';
        // 2 complete repetitions around the 360-degree orbit with clean spacing
        const fullLoop = `${phrase}      ${phrase}      `;
        const characters = Array.from(fullLoop);
        const totalChars = characters.length;
        // Orbit radius 5.7 units (accommodates larger letter size cleanly around Earth 3.55)
        const orbitRadius = 5.70;
        const angleStep = (Math.PI * 2) / totalChars;

        characters.forEach((char, i) => {
          // Skip whitespace or any glyph not explicitly defined in the typeface to eliminate any fallback '?'
          if (char === ' ' || !font.data.glyphs[char]) return;

          // Angle parameterization ensures words read naturally from LEFT to RIGHT across the visible front
          const angle = -i * angleStep;

          // Extruded 3D Text Geometry: Enlarge size by +37% (0.52 vs 0.38) and depth (0.20 vs 0.14)
          const letterGeo = new TextGeometry(char, {
            font: font,
            size: 0.52, // 35–45% enlargement for maximum cinematic readability
            depth: 0.20, // Increased thickness / extrusion depth
            curveSegments: 5,
            bevelEnabled: true,
            bevelThickness: 0.045,
            bevelSize: 0.024,
            bevelOffset: 0,
            bevelSegments: 2,
          });

          letterGeo.computeBoundingBox();
          const bb = letterGeo.boundingBox!;
          const charW = bb.max.x - bb.min.x;
          const charH = bb.max.y - bb.min.y;

          // Center letter on its local origin
          letterGeo.translate(-charW / 2, -charH / 2, -0.10);

          const letterMesh = new THREE.Mesh(letterGeo, silverRingMaterial);

          // Position letter along circular orbit
          letterMesh.position.x = orbitRadius * Math.cos(angle);
          letterMesh.position.z = orbitRadius * Math.sin(angle);
          letterMesh.position.y = 0;

          // Tangent orientation: Letter front face points radially outward, upright, reading left-to-right
          letterMesh.rotation.y = Math.PI / 2 - angle;

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

    // H. Multi-Axis Drag & Cursor Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragDeltaX = 0;
    let dragDeltaY = 0;
    let dragVelX = 0;
    let dragVelY = 0;
    let dragRotTargetX = 0;
    let dragRotTargetY = 0;
    let dragRotCurX = 0;
    let dragRotCurY = 0;

    const interactiveEl = interactiveLayerRef.current || container;

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      setIsUserInteracting(true);
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragVelX = 0;
      dragVelY = 0;
    };

    const handlePointerMove = (e: PointerEvent) => {
      // Normal cursor parallax
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      targetMouseX = nx;
      targetMouseY = ny;

      // Active dragging
      if (isDragging) {
        dragDeltaX = e.clientX - dragStartX;
        dragDeltaY = e.clientY - dragStartY;
        dragStartX = e.clientX;
        dragStartY = e.clientY;

        const sensitivity = 0.005;
        dragVelY = dragDeltaX * sensitivity;
        dragVelX = dragDeltaY * sensitivity;

        dragRotTargetY += dragVelY;
        dragRotTargetX += dragVelX;

        // Clamp vertical tilt to prevent flip
        dragRotTargetX = Math.max(-0.65, Math.min(0.65, dragRotTargetX));
      }
    };

    const handlePointerUp = () => {
      isDragging = false;
      setIsUserInteracting(false);
    };

    interactiveEl.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

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

    // J. Main 60fps Animation Loop with Delta-Time Smooth Timing
    let animId: number;
    let isVisible = true;
    const clock = new THREE.Clock();

    const handleVisibility = () => {
      isVisible = !document.hidden;
      if (isVisible) clock.getDelta(); // reset delta on resume to avoid jump
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const delta = Math.min(clock.getDelta(), 0.08); // Stable delta timing

      // Mouse lerp with smooth inertia
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Drag inertia & spring damping return
      if (!isDragging) {
        dragVelX *= 0.90;
        dragVelY *= 0.90;
        dragRotTargetX += dragVelX;
        dragRotTargetY += dragVelY;

        // Spring return towards neutral alignment
        dragRotTargetX += (0 - dragRotTargetX) * 0.025;
        dragRotTargetY += (0 - dragRotTargetY) * 0.025;
      }

      dragRotCurX += (dragRotTargetX - dragRotCurX) * 0.08;
      dragRotCurY += (dragRotTargetY - dragRotCurY) * 0.08;

      if (!prefersReducedMotion) {
        // Multi-axis responsive Earth tilt and drag rotation
        earthGroup.rotation.x = dragRotCurX + mouseY * 0.08;
        earthGroup.rotation.y = dragRotCurY + mouseX * 0.12;

        // Interactive 3D tilt of the typography ring in response to multi-axis drag & cursor
        ringParent.rotation.x = baseTiltX + dragRotCurX * 0.65 + mouseY * 0.12;
        ringParent.rotation.z = baseTiltZ + dragRotCurY * 0.65 + mouseX * 0.14;

        // Subtle camera parallax
        camera.position.x = mouseX * 0.40;
        camera.position.y = -mouseY * 0.28;
        camera.lookAt(0, 0, 0);

        // Majestic Earth axial rotation
        earthSphere.rotation.y += 0.018 * delta;

        // Cloud layer drifts smoothly for atmospheric movement
        cloudSphere.rotation.y += 0.028 * delta;

        // Continuous orbital traveling motion of the 3D typography ring
        // Reversed orbital direction (-=) at smooth, noticeable cinematic speed (0.11 * delta)
        if (ringRotGroup) {
          ringRotGroup.rotation.y -= 0.11 * delta;
        }

        // Subtle stellar background drift
        stars.rotation.y += 0.005 * delta;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      interactiveEl.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      cancelAnimationFrame(animId);

      renderer.dispose();
      starGeo.dispose();
      starMat.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      cloudGeo.dispose();
      cloudMat.dispose();
      cloudTex.dispose();
      atmosphereGeo.dispose();
      atmosphereMat.dispose();
      fallbackTexture.dispose();

      if (container && renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <section className="relative w-full overflow-hidden min-h-[660px] sm:min-h-[740px] lg:min-h-[820px] flex items-center justify-center bg-[#03060B] select-none">
      {/* 1. Left-Side Flowing Midnight Cosmic Light Atmosphere Canvas */}
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

      {/* 3. Interactive Drag Catchment Layer (Allows user to click/touch drag Earth across multi-axes) */}
      <div
        ref={interactiveLayerRef}
        className={`absolute inset-0 z-15 cursor-grab active:cursor-grabbing touch-none ${
          isUserInteracting ? 'cursor-grabbing' : ''
        }`}
        aria-label="Interactive 3D Earth space - drag to explore orbit"
      />

      {/* 4. Subtle Cosmic Vignette & Contrast Gradients */}
      <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-[#03060B] via-transparent to-[#03060B]/80" />
      <div className="absolute inset-0 z-20 pointer-events-none bg-[radial-gradient(ellipse_at_30%_50%,_rgba(11,23,39,0.55)_0%,_transparent_70%)]" />

      {/* 5. Foreground Hero Content Container */}
      <div className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col justify-center min-h-[620px] pointer-events-none">
        {/* Left-Side Dominant Title Hierarchy */}
        <div className="max-w-2xl text-left space-y-4 sm:space-y-5 pointer-events-auto">
          {/* Season Badge (Midnight Cosmic Theme) */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#050B16]/90 border border-[#1D5E91]/50 text-[#79C9F2] text-[11px] font-spartan font-black uppercase tracking-[0.3em] backdrop-blur-md shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#79C9F2] animate-pulse" />
            <span>2026 — 2027</span>
          </div>

          {/* Title Composition:
              ATHLOS appears first.
              WAR OF BATCHES appears immediately below it.
              WAR OF BATCHES MUST have a larger font size than ATHLOS!
              Metallic Silver, Ice-Blue and Starlight White cosmic gradient.
              League Spartan typeface.
          */}
          <div className="space-y-1">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-spartan font-black uppercase tracking-[0.18em] text-[#C7D3DF] leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
              ATHLOS
            </h2>
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] xl:text-[8.5rem] font-spartan font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#FFFFFF] via-[#F2F7FC] via-[#C7D3DF] to-[#79C9F2] drop-shadow-[0_12px_45px_rgba(121,201,242,0.35)] leading-[0.9]">
              WAR OF BATCHES
            </h1>
          </div>

          {/* Interactive Navigation Actions */}
          <div className="pt-4 sm:pt-5 flex flex-wrap items-center gap-3.5">
            <button
              onClick={() => {
                const el = document.getElementById('leaderboard-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                if (onExploreClick) onExploreClick();
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#0B1727] via-[#0D1E36] to-[#050B16] border border-[#1D5E91]/80 hover:border-[#79C9F2] text-[#F2F7FC] text-xs font-spartan font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-[0_4px_25px_rgba(121,201,242,0.25)] hover:shadow-[0_6px_35px_rgba(121,201,242,0.45)] hover:scale-[1.02]"
            >
              Explore Standings
            </button>

            <Link
              href="/matches"
              className="px-6 py-3 rounded-xl bg-[#050B16]/85 border border-[#0B1727] hover:border-[#1D5E91] text-[#C7D3DF] hover:text-white text-xs font-spartan font-bold uppercase tracking-[0.2em] transition-all duration-300 hover:scale-[1.02]"
            >
              Tournament Fixtures
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
