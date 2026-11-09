import React, { useEffect, useRef } from 'react';

/**
 * GenerativeVisualizer
 * High-performance, canvas-based audio visualizer powered by generative animation algorithms.
 * Renders dynamic frequency bars, smooth wave harmonics, or pulse ripples.
 */
export default function GenerativeVisualizer({
  isPlaying = false,
  color = 'purple',
  height = 40,
  barCount = 28,
  mode = 'bars',
  className = ''
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let phase = 0;

    // Palette mapping
    const palettes = {
      purple: ['#c084fc', '#8b5cf6', '#6366f1'],
      emerald: ['#34d399', '#10b981', '#059669'],
      cyan: ['#38bdf8', '#06b6d4', '#0284c7'],
      rose: ['#fb7185', '#f43f5e', '#e11d48'],
      amber: ['#fbbf24', '#f59e0b', '#d97706']
    };
    const activePalette = palettes[color] || palettes.purple;

    const render = () => {
      const width = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, width, h);

      // Speed adjusts based on playing state
      const speed = isPlaying ? 0.08 : 0.02;
      phase += speed;

      if (mode === 'bars') {
        const gap = 3;
        const barWidth = (width - gap * (barCount - 1)) / barCount;

        for (let i = 0; i < barCount; i++) {
          const norm = i / barCount;
          // Generative harmonic heights using multi-frequency sine waves
          const wave1 = Math.sin(phase * 1.5 + norm * Math.PI * 3);
          const wave2 = Math.cos(phase * 2.2 + norm * Math.PI * 5);
          const rawHeight = isPlaying
            ? Math.abs(wave1 * 0.6 + wave2 * 0.4)
            : 0.15 + Math.sin(phase + norm * Math.PI) * 0.08;

          const barH = Math.max(4, rawHeight * (h - 4));
          const x = i * (barWidth + gap);
          const y = (h - barH) / 2;

          // Gradient fill
          const grad = ctx.createLinearGradient(0, y, 0, y + barH);
          grad.addColorStop(0, activePalette[0]);
          grad.addColorStop(0.5, activePalette[1]);
          grad.addColorStop(1, activePalette[2]);

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barH, [2]);
          ctx.fill();
        }
      } else if (mode === 'wave') {
        ctx.beginPath();
        ctx.moveTo(0, h / 2);

        for (let x = 0; x <= width; x += 4) {
          const norm = x / width;
          const amp = isPlaying ? h * 0.35 : h * 0.1;
          const y =
            h / 2 +
            Math.sin(phase * 2 + norm * 8) * amp * Math.cos(norm * Math.PI) +
            Math.sin(phase * 3 + norm * 16) * (amp * 0.4);
          ctx.lineTo(x, y);
        }

        ctx.strokeStyle = activePalette[1];
        ctx.lineWidth = 2.5;
        ctx.shadowColor = activePalette[0];
        ctx.shadowBlur = isPlaying ? 10 : 3;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, color, barCount, mode]);

  return (
    <div className={`relative flex items-center overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        width={barCount * 8}
        height={height}
        className="w-full h-full block"
      />
    </div>
  );
}

