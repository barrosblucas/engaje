'use client';

import { useEffect, useMemo, useRef } from 'react';

type DotPoint = {
  x: number;
  y: number;
  opacity: number;
};

type RouteSegment = {
  delay: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

const ROUTES: RouteSegment[] = [
  { startX: 0.18, startY: 0.62, endX: 0.36, endY: 0.34, delay: 0 },
  { startX: 0.36, startY: 0.34, endX: 0.56, endY: 0.46, delay: 1.3 },
  { startX: 0.12, startY: 0.24, endX: 0.29, endY: 0.66, delay: 0.7 },
  { startX: 0.72, startY: 0.28, endX: 0.47, endY: 0.62, delay: 1.9 },
];

function createDots(width: number, height: number): DotPoint[] {
  const dots: DotPoint[] = [];
  const gap = 14;

  for (let x = 0; x < width; x += gap) {
    for (let y = 0; y < height; y += gap) {
      const nx = x / width;
      const ny = y / height;
      const inMapShape =
        (nx > 0.04 && nx < 0.27 && ny > 0.09 && ny < 0.42) ||
        (nx > 0.13 && nx < 0.3 && ny > 0.39 && ny < 0.82) ||
        (nx > 0.32 && nx < 0.49 && ny > 0.15 && ny < 0.36) ||
        (nx > 0.37 && nx < 0.53 && ny > 0.33 && ny < 0.67) ||
        (nx > 0.48 && nx < 0.73 && ny > 0.11 && ny < 0.5) ||
        (nx > 0.66 && nx < 0.84 && ny > 0.63 && ny < 0.84);

      if (!inMapShape) {
        continue;
      }

      const jitter = ((x + y) % 11) / 12;
      dots.push({
        x,
        y,
        opacity: 0.16 + jitter * 0.42,
      });
    }
  }

  return dots;
}

function drawAnimatedPath(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  route: RouteSegment,
  timeInSeconds: number,
) {
  const routeDuration = 2.5;
  const cycleDuration = 9;
  const elapsed = (timeInSeconds + route.delay) % cycleDuration;
  const progress = Math.min(elapsed / routeDuration, 1);

  const startX = route.startX * width;
  const startY = route.startY * height;
  const endX = route.endX * width;
  const endY = route.endY * height;
  const currentX = startX + (endX - startX) * progress;
  const currentY = startY + (endY - startY) * progress;

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(currentX, currentY);
  ctx.strokeStyle = 'rgba(26, 60, 110, 0.75)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(startX, startY, 2.7, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(26, 60, 110, 0.85)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(currentX, currentY, 2.7, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(249, 115, 22, 0.95)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(currentX, currentY, 6.4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(249, 115, 22, 0.18)';
  ctx.fill();
}

export function DotMapCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const parent = canvas.parentElement;
    if (!parent) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    let frameId = 0;
    let dots: DotPoint[] = [];

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      const width = Math.max(1, Math.floor(entry.contentRect.width));
      const height = Math.max(1, Math.floor(entry.contentRect.height));
      canvas.width = width;
      canvas.height = height;
      dots = createDots(width, height);
    });

    resizeObserver.observe(parent);

    const renderFrame = (time: number) => {
      const width = canvas.width;
      const height = canvas.height;
      if (!width || !height) {
        frameId = window.requestAnimationFrame(renderFrame);
        return;
      }

      context.clearRect(0, 0, width, height);

      for (const dot of dots) {
        context.beginPath();
        context.arc(dot.x, dot.y, 1.1, 0, Math.PI * 2);
        context.fillStyle = `rgba(26, 60, 110, ${dot.opacity})`;
        context.fill();
      }

      const timeInSeconds = time / 1000;
      for (const route of ROUTES) {
        drawAnimatedPath(context, width, height, route, timeInSeconds);
      }

      if (prefersReducedMotion) {
        return;
      }

      frameId = window.requestAnimationFrame(renderFrame);
    };

    frameId = window.requestAnimationFrame(renderFrame);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
    };
  }, [prefersReducedMotion]);

  return <canvas ref={canvasRef} className="login-map-canvas" aria-hidden />;
}
