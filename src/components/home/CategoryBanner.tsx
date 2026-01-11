import React from 'react';
import { Link } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
}

interface CategoryBannerProps {
  categories: Category[];
}

const CategoryBanner: React.FC<CategoryBannerProps> = ({ categories }) => {
  const defaultCategories = [
    { name: 'Mobiles', icon: '📱' },
    { name: 'Electronics', icon: '💻' },
    { name: 'Fashion', icon: '👕' },
    { name: 'Home', icon: '🏠' },
    { name: 'Appliances', icon: '🔌' },
    { name: 'Beauty', icon: '💄' },
    { name: 'Toys', icon: '🧸' },
    { name: 'Grocery', icon: '🛒' },
  ];

  return (
    <div className="bg-card shadow-sm py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center overflow-x-auto gap-4 md:gap-8 pb-2">
          {categories.length > 0 ? (
            categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="flex flex-col items-center min-w-[80px] hover:text-primary transition-colors"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-muted mb-2">
                  {category.imageUrl ? (
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      {defaultCategories.find(c => c.name.toLowerCase() === category.name.toLowerCase())?.icon || '📦'}
                    </div>
                  )}
                </div>
                <span className="text-xs md:text-sm font-medium text-center">{category.name}</span>
              </Link>
            ))
          ) : (
            defaultCategories.map((category, index) => (
              <div
                key={index}
                className="flex flex-col items-center min-w-[80px] opacity-50"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-muted mb-2 flex items-center justify-center text-3xl">
                  {category.icon}
                </div>
                <span className="text-xs md:text-sm font-medium text-center">{category.name}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryBanner;
