"use client";

import { useRef, useEffect, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  baseX: number;
  baseY: number;
}

function getThemeColors() {
  return { dot: "124, 58, 237", line: "124, 58, 237" };
}

export default function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, radius: 160 });
  const scrollRef = useRef(0);
  const colorsRef = useRef({ dot: "124, 58, 237", line: "124, 58, 237" });

  const initParticles = useCallback((width: number, height: number): Particle[] => {
    const count = Math.min(Math.floor((width * height) / 6000), 180);
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 1.5 + 0.5;
      particles.push({
        x,
        y,
        size,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.25 + 0.2,
        baseX: x,
        baseY: y,
      });
    }
    return particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    colorsRef.current = getThemeColors();

    let animationId: number;
    let particles: Particle[] = [];

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      canvas!.style.width = `${window.innerWidth}px`;
      canvas!.style.height = `${window.innerHeight}px`;
      ctx!.scale(dpr, dpr);
      particles = initParticles(window.innerWidth, window.innerHeight);
    }

    function animate() {
      ctx!.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const { dot, line } = colorsRef.current;
      const mouse = mouseRef.current;
      const scrollOffset = scrollRef.current * 0.03;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius && dist > 0) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          p.x -= Math.cos(angle) * force * 2;
          p.y -= Math.sin(angle) * force * 2;
        }

        const targetX = p.baseX + scrollOffset * (p.baseX / window.innerWidth - 0.5) * 2;
        const targetY = p.baseY + scrollOffset * (p.baseY / window.innerHeight - 0.5) * 2;
        p.x += (targetX - p.x) * 0.02;
        p.y += (targetY - p.y) * 0.02;

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0 || p.x > window.innerWidth) p.speedX *= -1;
        if (p.y < 0 || p.y > window.innerHeight) p.speedY *= -1;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${dot}, ${p.opacity})`;
        ctx!.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 130;

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.2;
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.strokeStyle = `rgba(${line}, ${alpha})`;
            ctx!.lineWidth = 0.7;
            ctx!.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    }

    function onMouseMove(e: MouseEvent) {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    }

    function onMouseLeave() {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    }

    function onScroll() {
      scrollRef.current = window.scrollY;
    }

    const observer = new MutationObserver(() => {
      colorsRef.current = getThemeColors();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    resize();
    animate();

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(animationId);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
