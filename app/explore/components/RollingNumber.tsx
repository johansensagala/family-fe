'use client';

import { useEffect, useState } from "react";

export default function RollingNumber({ value, duration = 500 }: { value: number, duration?: number }) {
    const [displayValue, setDisplayValue] = useState(value);

    useEffect(() => {
        let startTimestamp: number | null = null;
        const startValue = displayValue;
        const endValue = value;

        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // Logika linear interpolation
            const current = Math.floor(progress * (endValue - startValue) + startValue);
            
            setDisplayValue(current);

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };

        window.requestAnimationFrame(step);
    }, [value]);

    return <span>{displayValue}</span>;
}