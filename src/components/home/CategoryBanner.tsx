import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Percent, Smartphone, Shirt, Monitor, Tv } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
}

interface CategoryBannerProps {
  categories: Category[];
}

const defaultCategories = [
  { name: 'Categories', icon: LayoutGrid, color: 'bg-blue-100', slug: '' },
  { name: 'Offer Zone', icon: Percent, color: 'bg-orange-100', slug: 'offers', badge: 'NEW' },
  { name: 'Mobiles', icon: Smartphone, color: 'bg-red-50', slug: 'mobiles' },
  { name: 'Fashion', icon: Shirt, color: 'bg-pink-50', slug: 'fashion' },
  { name: 'Electronics', icon: Monitor, color: 'bg-blue-50', slug: 'electronics' },
  { name: 'Appliances', icon: Tv, color: 'bg-green-50', slug: 'appliances' },
];

const CategoryBanner: React.FC<CategoryBannerProps> = ({ categories }) => {
  const mergedCategories = defaultCategories.map(def => {
    const found = categories.find(c => c.slug.toLowerCase() === def.slug.toLowerCase());
    return {
      ...def,
      id: found?.id || def.slug,
      imageUrl: found?.imageUrl,
    };
  });

  return (
    <div className="bg-white py-3 shadow-sm">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-4 px-3 min-w-max">
          {mergedCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Link
                key={index}
                to={category.slug ? `/category/${category.slug}` : '/products'}
                className="flex flex-col items-center min-w-[60px] relative"
              >
                {category.badge && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded font-bold z-10">
                    {category.badge}
                  </span>
                )}
                <div className={`w-14 h-14 rounded-full ${category.color} flex items-center justify-center mb-1.5 overflow-hidden`}>
                  {category.imageUrl ? (
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icon className="h-7 w-7 text-gray-700" />
                  )}
                </div>
                <span className="text-[11px] font-medium text-gray-700 text-center whitespace-nowrap">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryBanner;
