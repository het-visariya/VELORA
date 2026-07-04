import { useEffect, useState } from 'react';
import woolOvercoatImg from '../assets/wool_overcoat_luxury.png';
import closetApi from '../api/closet.api';

const defaultItems = [
  { id: 1, name: 'Silk Shirt', brand: 'Maison', category: 'Women Tops', season: 'All', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop' },
  { id: 2, name: 'Tailored Trousers', brand: 'Velora', category: 'Women Bottoms', season: 'Spring', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop' },
  { id: 3, name: 'Cashmere Knitwear', brand: 'Velora', category: 'Women Tops', season: 'Autumn', image: 'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=800&auto=format&fit=crop' },
  { id: 4, name: 'Minimalist Boots', brand: 'Maison', category: 'Women Accessories', season: 'Winter', image: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=800&auto=format&fit=crop' },
  { id: 5, name: 'Structured Blazer', brand: 'Velora', category: 'Women Outerwear', season: 'All', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop' },
  { id: 6, name: 'Floral Summer Skirt', brand: 'Maison', category: 'Women Bottoms', season: 'Summer', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop' },
  { id: 7, name: 'Tailored Suit Jacket', brand: 'Velora', category: 'Men Tops', season: 'All', image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=800&auto=format&fit=crop' },
  { id: 8, name: 'Slim Fit Chinos', brand: 'Maison', category: 'Men Bottoms', season: 'Spring', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop' },
  { id: 9, name: 'Leather Biker Jacket', brand: 'Velora', category: 'Men Outerwear', season: 'Autumn', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop' },
  { id: 10, name: 'Classic Oxford Shoes', brand: 'Maison', category: 'Men Accessories', season: 'Winter', image: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?q=80&w=800&auto=format&fit=crop' },
  { id: 11, name: 'Wool Overcoat', brand: 'Velora', category: 'Women Outerwear', season: 'Winter', image: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?q=80&w=800&auto=format&fit=crop' },
  { id: 12, name: 'Oxford Dress Shirt', brand: 'Maison', category: 'Men Tops', season: 'All', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop' }
];

export function useCloset() {
  const [items, setItems] = useState(defaultItems);
  const [nextId, setNextId] = useState(items.length + 1);
  const [loading, setLoading] = useState(false);

  const loadItems = async () => {
    if (!localStorage.getItem('velora_token')) return;
    setLoading(true);
    try {
      const response = await closetApi.getItems();
      setItems(response.data || []);
    } catch (err) {
      console.error('Failed to load closet from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const addItem = async (item) => {
    if (localStorage.getItem('velora_token')) {
      const response = await closetApi.addItem(item);
      const savedItem = response.data;
      setItems((current) => [savedItem, ...current]);
      return savedItem;
    }

    const newItem = { ...item, id: nextId };
    setNextId((current) => current + 1);
    setItems((current) => [newItem, ...current]);
    return newItem;
  };

  return { items, setItems, addItem, loadItems, loading };
}

export default useCloset;
