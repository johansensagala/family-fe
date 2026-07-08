'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import topbar from 'topbar';

// Konfigurasi visual topbar agar senada dengan tema gelap & oranye kuis kamu
topbar.config({
    barThickness: 3,                  // Ketebalan garis loading (pixel)
    barColors: {
        '0': '#f97316',               // Warna awal: Orange-500 khas kuis
        '1.0': '#eab308'              // Warna akhir: Yellow-500 gradasi dinamis
    },
    shadowBlur: 10,
    shadowColor: 'rgba(249, 115, 22, 0.5)' // Efek neon glow orange
});

export default function PageLoader() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Skenario 1: Hentikan loading begitu URL/Pathname berubah sukses
    useEffect(() => {
        topbar.hide();
    }, [pathname, searchParams]);

    // Skenario 2: Intercept seluruh klik pada tag <a> global untuk memicu loading start
    useEffect(() => {
        const handleAnchorClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            // 💡 CEK: Jika elemen yang diklik (atau parent-nya) punya atribut data-skip-loader, langsung lompati!
            if (target.closest('[data-skip-loader="true"]')) {
                return;
            }

            const anchor = target.closest('a');

            if (anchor) {
                const href = anchor.getAttribute('href');
                const targetAttr = anchor.getAttribute('target');

                if (
                    href && 
                    !href.startsWith('#') && 
                    !href.startsWith('mailto:') &&
                    !href.startsWith('tel:') &&
                    targetAttr !== '_blank' &&
                    href !== pathname
                ) {
                    topbar.show();
                }
            }
        };

        document.addEventListener('click', handleAnchorClick);

        return () => {
            document.removeEventListener('click', handleAnchorClick);
        };
    }, [pathname]);

    return null; // Komponen ini bekerja di background, tidak merender elemen HTML visual langsung
}