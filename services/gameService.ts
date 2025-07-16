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
        const res = await fetch(`${BASE_URL}/games/create-questions`, {
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
