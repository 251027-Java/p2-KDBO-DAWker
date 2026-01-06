import React, { useRef, useEffect } from 'react';

type DitherProps = {
  waveColor?: [number, number, number]; // values 0..1
  disableAnimation?: boolean;
  enableMouseInteraction?: boolean;
  mouseRadius?: number;
  colorNum?: number;
  pixelSize?: number;
  waveAmplitude?: number;
  waveFrequency?: number;
  waveSpeed?: number;
};

export default function Dither({
  waveColor = [0.32, 0.15, 1],
  disableAnimation = false,
  enableMouseInteraction = false,
  mouseRadius = 1,
  colorNum = 4,
  pixelSize = 2,
  waveAmplitude = 0.3,
  waveFrequency = 3,
  waveSpeed = 0.05,
}: DitherProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const mouseRef = useRef<{x:number,y:number,active:boolean}>({x:0,y:0,active:false});
  const pausedRef = useRef<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    resize();
    const palette: string[] = [];
    // Interpret waveColor as normalized RGB base; create palette from darker -> base -> lighter
    const baseR = Math.round(waveColor[0] * 255);
    const baseG = Math.round(waveColor[1] * 255);
    const baseB = Math.round(waveColor[2] * 255);
    for (let i = 0; i < colorNum; i++) {
      const t = i / Math.max(1, colorNum - 1);
      // darker mix toward black for lower indexes, lighter toward base for higher
      const factor = 0.35 + 0.65 * t; // 0.35..1.0
      const r = Math.round(baseR * factor);
      const g = Math.round(baseG * factor);
      const b = Math.round(baseB * factor);
      palette.push(`rgb(${r}, ${g}, ${b})`);
    }

    let t = 0;

    function draw() {
      ctx.clearRect(0,0,width,height);
      const px = pixelSize;
      for (let y = 0; y < height; y += px) {
        for (let x = 0; x < width; x += px) {
          const nx = x / width - 0.5;
          const ny = y / height - 0.5;
          const wave = Math.sin((nx * waveFrequency + t * waveSpeed) * Math.PI * 2) * Math.cos((ny * waveFrequency + t * waveSpeed) * Math.PI * 2);
          let v = 0.5 + wave * waveAmplitude * 0.5;

          if (enableMouseInteraction && mouseRef.current.active) {
            const dx = (x / width) - mouseRef.current.x;
            const dy = (y / height) - mouseRef.current.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            // Treat mouseRadius as normalized fraction of the shorter dimension (0..1)
            const radius = Math.max(0.001, mouseRadius);
            const influence = Math.max(0, 1 - dist / radius);
            v += influence * 0.35;
          }

          // dither to nearest palette index
          let idx = Math.floor(v * colorNum);
          idx = Math.max(0, Math.min(colorNum - 1, idx));
          ctx.fillStyle = palette[idx];
          ctx.fillRect(x, y, px, px);
        }
      }
    }

    let lastTs: number | null = null;
    let lastDrawTs = 0;
    const minFrameMs = 1000 / 30; // target ~30 FPS to reduce load
    function step(ts: number) {
      if (lastTs == null) lastTs = ts;
      const dt = (ts - lastTs) / 1000; // seconds
      lastTs = ts;

      // If an input is focused (typing), pause or throttle drawing
      if (pausedRef.current) {
        // still advance animation time slowly so background isn't frozen abruptly
        if (!disableAnimation) t += dt * 0.2;
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      // throttle draw rate to minFrameMs
      if (ts - lastDrawTs < minFrameMs) {
        if (!disableAnimation) t += dt;
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      lastDrawTs = ts;
      if (!disableAnimation) t += dt;
      draw();
      rafRef.current = requestAnimationFrame(step);
    }

    window.addEventListener('resize', resize);
    // Pause/slow animation while typing: detect focus on inputs/contenteditable
    function onFocusIn(e: FocusEvent) {
      const el = e.target as HTMLElement | null;
      if (!el) return;
      const tag = el.tagName && el.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || el.isContentEditable) {
        pausedRef.current = true;
        // Cancel RAF to stop drawing while typing
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      }
    }
    function onFocusOut(_e: FocusEvent) {
      const active = document.activeElement as HTMLElement | null;
      const stillTyping = active && (active.tagName && active.tagName.toLowerCase() === 'input' || active && active.tagName && active.tagName.toLowerCase() === 'textarea' || active && active.isContentEditable);
      if (!stillTyping) {
        pausedRef.current = false;
        // Restart RAF loop if needed
        if (!rafRef.current) rafRef.current = requestAnimationFrame(step as FrameRequestCallback);
      }
    }
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    rafRef.current = requestAnimationFrame(step);

    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
  }, [waveColor, disableAnimation, enableMouseInteraction, mouseRadius, colorNum, pixelSize, waveAmplitude, waveFrequency, waveSpeed]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const c = canvasRef.current;
    function move(e: MouseEvent) {
      const rect = c.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) / rect.width;
      mouseRef.current.y = (e.clientY - rect.top) / rect.height;
      mouseRef.current.active = true;
    }
    function leave() { mouseRef.current.active = false; }
    function touchMove(ev: TouchEvent) {
      if (ev.touches && ev.touches[0]) {
        const rect = c.getBoundingClientRect();
        mouseRef.current.x = (ev.touches[0].clientX - rect.left) / rect.width;
        mouseRef.current.y = (ev.touches[0].clientY - rect.top) / rect.height;
        mouseRef.current.active = true;
      }
    }

    if (enableMouseInteraction) {
      c.addEventListener('mousemove', move);
      c.addEventListener('mouseleave', leave);
      c.addEventListener('touchmove', touchMove as EventListener);
    }

    return () => {
      if (enableMouseInteraction) {
        c.removeEventListener('mousemove', move);
        c.removeEventListener('mouseleave', leave);
        c.removeEventListener('touchmove', touchMove as EventListener);
      }
    }
  }, [enableMouseInteraction]);

  return (
    <canvas ref={canvasRef} className="dither-canvas" style={{width:'100%',height:'100%',display:'block'}} />
  );
}
