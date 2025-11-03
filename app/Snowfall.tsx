"use client";

import { useEffect, useRef } from "react";

interface SnowfallProps {
    count?: number;
    speed?: number;
    sizeRange?: [number, number];
}

interface Snowflake {
    x: number;
    y: number;
    r: number;
    vx: number;
    vy: number;
    alpha: number;
    swing: number;
    phase: number;
}

export default function Snowfall({
    count = 140,
    speed = 1.6,
    sizeRange = [4, 10],
}: SnowfallProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rafRef = useRef<number>();
    const flakesRef = useRef<Snowflake[]>([]);

    // simpan nilai props stabil agar tidak trigger reinit
    const countRef = useRef(count);
    const speedRef = useRef(speed);
    const sizeRangeRef = useRef(sizeRange);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = canvas.clientWidth;
        let height = canvas.clientHeight;
        const dpr = window.devicePixelRatio || 1;

        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        ctx.scale(dpr, dpr);

        const createFlakes = () => {
            const flakes: Snowflake[] = [];
            const actualCount = Math.max(20, Math.floor((width * countRef.current) / 1000));
            for (let i = 0; i < actualCount; i++) {
                flakes.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    r: Math.random() * (sizeRangeRef.current[1] - sizeRangeRef.current[0]) + sizeRangeRef.current[0],
                    vx: (Math.random() - 0.5) * 0.15,
                    vy: Math.random() * 1.2 * speedRef.current + 0.6 * speedRef.current,
                    alpha: 0.6 + Math.random() * 0.4,
                    swing: Math.random() * 0.01 + 0.003,
                    phase: Math.random() * Math.PI * 2,
                });
            }
            flakesRef.current = flakes;
        };

        const resize = () => {
            width = canvas.clientWidth;
            height = canvas.clientHeight;
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            ctx.scale(dpr, dpr);
            createFlakes();
        };

        const update = () => {
            ctx.clearRect(0, 0, width, height);
            const flakes = flakesRef.current;

            for (const f of flakes) {
                f.phase += f.swing;
                f.x += Math.sin(f.phase) * 0.25 + f.vx;
                f.y += f.vy;

                if (f.x > width + 10) f.x = -10;
                if (f.x < -10) f.x = width + 10;
                if (f.y > height + 10) {
                    f.y = -10;
                    f.x = Math.random() * width;
                    f.vy = Math.random() * 1.2 * speedRef.current + 0.6 * speedRef.current;
                }

                ctx.globalAlpha = f.alpha;
                const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 2);
                grad.addColorStop(0, "rgba(255,255,255,1)");
                grad.addColorStop(0.6, "rgba(255,255,255,0.7)");
                grad.addColorStop(1, "rgba(255,255,255,0)");
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
                ctx.fill();
            }

            rafRef.current = requestAnimationFrame(update);
        };

        createFlakes();
        rafRef.current = requestAnimationFrame(update);

        const ro = new ResizeObserver(resize);
        ro.observe(canvas);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            ro.disconnect();
        };
    }, []); // ⬅️ hanya dijalankan sekali

    return (
        <canvas
            ref={canvasRef}
            className="pointer-events-none absolute inset-0 z-40"
            style={{ display: "block", width: "100%", height: "100%" }}
        />
    );
}
