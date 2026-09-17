import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Category } from '@/types';
import { fetchCategories } from '@/services/catalog';
import { getCategoryImage } from '@/utils/categoryImages';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-bold text-royal-900 sm:text-3xl">All Categories</h1>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/shop?category=${cat.slug}`}
            className="relative overflow-hidden rounded-2xl aspect-square bg-royal-50 shadow-[var(--shadow-soft)] group"
          >
            <img
              src={getCategoryImage(cat)}
              alt={cat.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-royal-950/80 to-transparent" />
            <span className="absolute bottom-3 left-3 text-sm font-bold text-white">{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
