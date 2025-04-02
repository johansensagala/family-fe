export const getItems = async () => {
    const res = await fetch('http://localhost:5000/items');
    return await res.json();
};
  
export const getItemById = async (id: string) => {
    const res = await fetch(`http://localhost:5000/items/${id}`);
    return await res.json();
};

export const updateItem = async (id: string, item: any) => {
    const res = await fetch(`http://localhost:5000/items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(item),
        headers: { 'Content-Type': 'application/json' },
    });
    return await res.json();
};

export async function createItem(item: { name: string; description: string; price: number }) {
    const response = await fetch('http://localhost:5000/items', {
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
