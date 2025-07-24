const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const getItemById = async (id: string) => {
    const res = await fetch(`${BASE_URL}/items/${id}`);
    return await res.json();
};

export const updateItem = async (id: string, item: any) => {
    const res = await fetch(`${BASE_URL}/items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(item),
        headers: { 'Content-Type': 'application/json' },
    });
    return await res.json();
};

export async function createItem(item: { name: string; description: string }) {
    const response = await fetch(`${BASE_URL}/items`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
    });

    if (!response.ok) {
        throw new Error('Failed to create item');
    }
    return response.json();
}

// GAMES
export const getAllGames = async () => {
    const res = await fetch(`${BASE_URL}/games`);
    return await res.json();
};

export const getGamesById = async (id: string) => {
    const res = await fetch(`${BASE_URL}/games/${id}`);
    return await res.json();
};
    
export const createQuestion = async (payload: {
    question: string;
    answers: { answer: string; poin: number; isSurprise: boolean }[];
    }) => {
        const res = await fetch(`${BASE_URL}/games/questions/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const msg = await res.text();
            throw new Error(`Failed to create question: ${msg}`);
        }

    return await res.json();
};

export const getAllQuestions = async () => {
    const res = await fetch(`${BASE_URL}/games/questions`);
    
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Failed to fetch questions: ${msg}`);
    }

    return await res.json();
};

export async function getQuestionById(id: number | string) {
    const res = await fetch(`${BASE_URL}/games/questions/${id}`);
    
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Failed to fetch question: ${msg}`);
    }

    return await res.json();
}

export async function updateQuestion(id: number | string, payload: any) {
    const res = await fetch(`${BASE_URL}/games/questions/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Failed to update question: ${msg}`);
    }

    return await res.json();
}

export async function createGameWithRounds(payload: {
    name: string;
    description?: string;
    rounds: {
        questionId: string | number;
        order: number;
        double: boolean;
    }[];
}) {
    const res = await fetch(`${BASE_URL}/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Failed to create game with rounds: ${msg}`);
    }

    return await res.json();
}

// Get a single game by ID
export const getGameById = async (id: number | string) => {
    const res = await fetch(`${BASE_URL}/games/${id}`);

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Failed to fetch game: ${msg}`);
    }

    return await res.json();
};

// Update an existing game
export const updateGame = async (id: number | string, payload: {
    name: string;
    rounds: {
        questionId: number | string;
        type: string;
    }[];
}) => {
    const res = await fetch(`${BASE_URL}/games/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Failed to update game: ${msg}`);
    }

    return await res.json();
};
