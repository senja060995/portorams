'use client';

import React, { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

export const Interactive3DGlobe: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const phiRef = useRef(0);

  useEffect(() => {
    let width = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onResize = () => {
      if (canvas) {
        width = canvas.offsetWidth;
      }
    };
    window.addEventListener('resize', onResize);
    onResize();

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: width * 2 || 800,
      height: width * 2 || 800,
      phi: 0,
      theta: 0.25,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.05, 0.08, 0.15],
      markerColor: [0.02, 0.71, 0.83], // Neon Cyan #06b6d4
      glowColor: [0.08, 0.2, 0.35],
      markers: [
        // Jakarta, Indonesia (RAMS HQ)
        { location: [-6.2088, 106.8456], size: 0.1 },
        // Singapore
        { location: [1.3521, 103.8198], size: 0.06 },
        // Tokyo, Japan
        { location: [35.6762, 139.6503], size: 0.07 },
        // Sydney, Australia
        { location: [-33.8688, 151.2093], size: 0.06 },
        // San Francisco, USA
        { location: [37.7749, -122.4194], size: 0.08 },
        // London, UK
        { location: [51.5074, -0.1278], size: 0.07 },
        // Dubai, UAE
        { location: [25.2048, 55.2708], size: 0.06 },
      ],
      arcs: [
        // Jakarta -> Singapore
        { from: [-6.2088, 106.8456], to: [1.3521, 103.8198] },
        // Jakarta -> Tokyo
        { from: [-6.2088, 106.8456], to: [35.6762, 139.6503] },
        // Singapore -> London
        { from: [1.3521, 103.8198], to: [51.5074, -0.1278] },
        // Tokyo -> San Francisco
        { from: [35.6762, 139.6503], to: [37.7749, -122.4194] },
      ],
      arcColor: [0.02, 0.71, 0.83],
      arcWidth: 0.4,
    });

    let animId: number;
    const animate = () => {
      if (!pointerInteracting.current) {
        phiRef.current += 0.004;
      }
      globe.update({ phi: phiRef.current + pointerInteractionMovement.current });
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);

    setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.style.opacity = '1';
      }
    });

    return () => {
      cancelAnimationFrame(animId);
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className={`relative w-full max-w-[500px] aspect-square mx-auto flex items-center justify-center ${className}`}>
      {/* Outer Cyan & Violet Atmospheric Glow Ring */}
      <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-neon-cyan/20 via-neon-blue/10 to-neon-violet/20 blur-3xl pointer-events-none"></div>

      {/* Canvas WebGL 3D Globe */}
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
          if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
        }}
        onPointerUp={() => {
          pointerInteracting.current = null;
          if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
        }}
        onPointerOut={() => {
          pointerInteracting.current = null;
          if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
        }}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta * 0.008;
          }
        }}
        onTouchMove={(e) => {
          if (pointerInteracting.current !== null && e.touches[0]) {
            const delta = e.touches[0].clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta * 0.008;
          }
        }}
        className="w-full h-full opacity-0 transition-opacity duration-1000 cursor-grab relative z-10"
      />
    </div>
  );
};
