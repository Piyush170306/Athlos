'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // degrees
  glareEffect?: boolean;
}

export default function TiltCard({
  children,
  className = '',
  maxTilt = 8,
  glareEffect = true,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);

  const rotateX = useTransform(smoothY, [0, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(smoothX, [0, 1], [-maxTilt, maxTilt]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    x.set(clientX / rect.width);
    y.set(clientY / rect.height);
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        rotateX,
        rotateY,
      }}
      whileHover={{ scale: 1.015 }}
      transition={{ duration: 0.2 }}
      className={`relative perspective-[1000px] ${className}`}
    >
      {children}

      {/* Subtle dynamic gold glare overlay */}
      {glareEffect && isHovered && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none z-20 mix-blend-overlay transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${x.get() * 100}% ${y.get() * 100}%, rgba(245, 218, 122, 0.25) 0%, rgba(229, 184, 66, 0.05) 50%, transparent 80%)`,
          }}
        />
      )}
    </motion.div>
  );
}