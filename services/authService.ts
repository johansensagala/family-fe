const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ==========================================
// USERS & AUTH SERVICE
// ==========================================

/**
 * Login: Browser akan otomatis menyimpan Set-Cookie dari backend
 */
export const login = async (loginDto: any) => {
    const res = await fetch(`${BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginDto),
        // CRITICAL: Supaya browser mau menerima/menyimpan cookie HttpOnly
        credentials: 'include', 
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Invalid credentials');
    }

    return await res.json(); 
};

/**
 * Register: Membuat user baru
 */
export const register = async (registerUserDto: { name: string; email: string; password: any }) => {
    const res = await fetch(`${BASE_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerUserDto),
        credentials: 'include', 
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Failed to register');
    }

    return await res.json();
};

/**
 * Logout: Memanggil endpoint backend untuk menghapus (clear) cookie
 */
export const logout = async () => {
    const res = await fetch(`${BASE_URL}/users/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // CRITICAL: Harus menyertakan cookie agar backend tahu token mana yang mau di-revoke/clear
        credentials: 'include', 
    });

    // SUDAH BERSIH: Tidak ada localStorage.removeItem()!
    // Backend akan mengirimkan header Set-Cookie yang expired untuk menghapus cookie di browser.

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Logout warning: ${msg}`);
    }

    return await res.json();
};

/**
 * HELPER: fetchWithAuth
 * Mengirimkan HttpOnly Cookie secara otomatis dan menangani sesi kedaluwarsa.
 */
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
    console.log(`fetchWithAuth called: ${endpoint} with options:`, options); // Debug log

    console.log(`Current BASE_URL: ${BASE_URL}`); // Debug log untuk memastikan URL benar
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        // CRITICAL: Ini memberitahu browser untuk menyertakan cookie HttpOnly dalam request
        credentials: 'include', 
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!res.ok) {
        if (res.status === 401) {
            // Karena kita pakai HttpOnly, kita tidak bisa hapus token manual.
            // Cukup arahkan user kembali ke login.
            throw new Error('Unauthorized');
        }
        const msg = await res.text();
        throw new Error(msg || `Request gagal dengan status ${res.status}`);
    }

    const contentType = res.headers.get("content-type");
    return contentType && contentType.includes("application/json") 
        ? await res.json() 
        : null;
};