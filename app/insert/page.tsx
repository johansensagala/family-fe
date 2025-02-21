'use client';

import { useState } from 'react';
import { createItem } from '../../services/itemService';

export default function InsertItemPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await createItem({ name, description, price });
      alert('Item berhasil ditambahkan');
      setName('');
      setDescription('');
      setPrice(0);
    } catch (error) {
      setError('Gagal membuat item: ' + error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-6">Insert Item</h1>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg space-y-4">
        <div>
          <label htmlFor="name" className="block text-xl font-semibold text-gray-700">Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-xl font-semibold text-gray-700">Description</label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="price" className="block text-xl font-semibold text-gray-700">Price</label>
          <input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
            required
            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full p-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300"
        >
          Add Item
        </button>
      </form>
    </div>
  );
}
