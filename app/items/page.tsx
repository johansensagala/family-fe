'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getItems } from '../../services/itemService';

interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
}

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchItems = async () => {
      const data = await getItems();
      setItems(data);
    };
    fetchItems();
  }, []);

  const handleInsert = () => {
    router.push('/items/insert');
  };

  const handleEdit = (id: string) => {
    router.push(`/items/edit/${id}`);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-6">Item List</h1>
      <div className="flex justify-between mb-6">
        <button
          onClick={handleInsert}
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-300"
        >
          Insert Item
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
          <table className="min-w-full table-auto mx-auto border-collapse">
            <thead>
              <tr className="bg-blue-100">
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Name</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Description</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Price</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="px-4 py-2 text-gray-700">{item.name}</td>
                  <td className="px-4 py-2 text-gray-700">{item.description}</td>
                  <td className="px-4 py-2 text-gray-700">${item.price}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleEdit(item.id)}
                      className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
