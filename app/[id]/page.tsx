'use client';

import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

const EditItemPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const [item, setItem] = useState<{ name: string; description: string; price: number }>({
    name: '',
    description: '',
    price: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await fetch(`http://localhost:5000/items/${id}`);
        if (res.ok) {
          const data = await res.json();
          setItem(data);
        } else {
          throw new Error('Item tidak ditemukan');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`http://localhost:5000/items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });

      if (res.ok) {
        alert('Item berhasil diperbarui!');
        router.push('/items');
      } else {
        throw new Error('Gagal memperbarui item');
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-6">Edit Item</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg space-y-4">
        <div>
          <label htmlFor="name" className="block text-xl font-semibold text-gray-700">Name</label>
          <input
            id="name"
            type="text"
            value={item.name}
            onChange={(e) => setItem({ ...item, name: e.target.value })}
            required
            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-xl font-semibold text-gray-700">Description</label>
          <input
            id="description"
            type="text"
            value={item.description}
            onChange={(e) => setItem({ ...item, description: e.target.value })}
            required
            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="price" className="block text-xl font-semibold text-gray-700">Price</label>
          <input
            id="price"
            type="number"
            value={item.price}
            onChange={(e) => setItem({ ...item, price: parseFloat(e.target.value) })}
            required
            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full p-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300"
        >
          Update Item
        </button>
      </form>
    </div>
  );
};

export default EditItemPage;
