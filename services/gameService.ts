import { fetchWithAuth } from "./authService";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ==========================================
// 1. ITEMS API
// ==========================================

export const getItemById = (id: string) => fetchWithAuth(`/items/${id}`);

export const createItem = (item: { name: string; description: string }) => 
    fetchWithAuth('/items', {
        method: 'POST',
        body: JSON.stringify(item),
    });

export const updateItem = (id: string, item: any) => 
    fetchWithAuth(`/items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(item),
    });

// ==========================================
// 2. QUESTIONS API
// ==========================================

export const getAllQuestions = (search = "", limit = 10, offset = 0) => 
    fetchWithAuth(`/games/questions?search=${search}&limit=${limit}&offset=${offset}`);

export const getQuestionById = (id: number | string) => 
    fetchWithAuth(`/games/questions/${id}`);

export const createQuestion = (payload: {
    question: string;
    answers: { answer: string; poin: number; isSurprise: boolean }[];
}) => fetchWithAuth('/games/questions/add', {
    method: 'POST',
    body: JSON.stringify(payload),
});

export const updateQuestion = (id: number | string, payload: any) => 
    fetchWithAuth(`/games/questions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });

/**
 * Menghapus pertanyaan berdasarkan ID
 */
export const deleteQuestion = (id: number | string) => 
    fetchWithAuth(`/games/questions/${id}`, {
        method: 'DELETE',
    });

// ==========================================
// 3. GAMES API
// ==========================================

export const getAllGames = (limit = 10, offset = 0, include = "", search = "") => 
    fetchWithAuth(`/games?limit=${limit}&offset=${offset}&include=${include}&search=${search}`);

/**
 * Mendapatkan game publik menggunakan algoritma hot ranking/populer
 */
export const getPublicGames = (limit = 10, offset = 0, search = "") => 
    fetchWithAuth(`/games/public?limit=${limit}&offset=${offset}&search=${search}`);

export const getFavoriteGames = (limit = 10, offset = 0) => 
    fetchWithAuth(`/games/favorites?limit=${limit}&offset=${offset}`);

export const toggleFavoriteGame = (id: number | string) => 
    fetchWithAuth(`/games/${id}/favorite`, {
        method: 'POST', // atau 'PATCH' sesuai dengan implementasi di controller NestJS kamu
    });

export const getGameById = (id: number | string) => fetchWithAuth(`/games/${id}`);

export const createGameWithRounds = (payload: {
    name: string;
    description?: string;
    rounds: {
        questionId: string | number;
        type: string;
    }[];
}) => fetchWithAuth('/games', {
    method: 'POST',
    body: JSON.stringify(payload),
});

export const updateGame = (id: number | string, payload: {
    name: string;
    rounds: { questionId: number | string; type: string }[];
}) => fetchWithAuth(`/games/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
});

export const generateRandomGame = () => 
    fetchWithAuth('/games/generate-random', {
        method: 'POST',
    });

export const deleteGame = (id: number | string) => 
    fetchWithAuth(`/games/${id}`, {
        method: 'DELETE',
    });

// ==========================================
// CATEGORIES API
// ==========================================

export const getAllCategories = () => 
    fetchWithAuth('/games/categories');

export const createCategory = (payload: { name: string; description?: string }) => 
    fetchWithAuth('/games/categories', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

export const updateCategory = (id: number | string, payload: { name?: string; description?: string }) => 
    fetchWithAuth(`/games/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });

export const deleteCategory = (id: number | string) => 
    fetchWithAuth(`/games/categories/${id}`, {
        method: 'DELETE',
    });

// ==========================================
// 4. STATISTICS & REVIEWS API
// ==========================================

/**
 * Menambah review baru (UserId diambil dari JWT di Backend)
 */
export const addGameReview = (payload: { 
    gameId: number; 
    rating: number; 
    comment?: string 
}) => fetchWithAuth('/statistics/reviews', {
    method: 'POST',
    body: JSON.stringify(payload),
});

/**
 * Mendapatkan semua review untuk satu game
 */
export const getGameReviews = (gameId: number | string) => 
    fetchWithAuth(`/statistics/reviews/${gameId}`);

/**
 * 1. Update/Edit Review yang sudah ada
 * Menyesuaikan dengan backend: @Patch('reviews/:id')
 */
export const updateGameReview = (id: number | string, payload: { rating: number; comment?: string }) => 
    fetchWithAuth(`/statistics/reviews/${id}`, {
        method: 'PATCH', // 👈 WAJIB PATCH: karena di backend kamu pakai @Patch
        body: JSON.stringify(payload),
    });

/**
 * 2. Delete/Hapus Review berdasarkan ID Review
 * Menyesuaikan dengan backend: @Delete('reviews/:id')
 */
export const deleteGameReview = (id: number | string) => 
    fetchWithAuth(`/statistics/reviews/${id}`, {
        method: 'DELETE',
    });

export const recordGameInteraction = (gameId: number | string, type: 'view' | 'play' | 'share') => 
    fetchWithAuth(`/statistics/record/${gameId}?type=${type}`, {
        method: 'POST',
    });

