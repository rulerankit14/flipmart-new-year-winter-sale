import React, { useState, useEffect } from 'react';
import winterSaleBanner from '@/assets/winter-sale-banner.jpg';

const banners = [
  {
    id: 1,
    image: winterSaleBanner,
  },
  {
    id: 2,
    image: winterSaleBanner,
  },
  {
    id: 3,
    image: winterSaleBanner,
  },
];

const HeroBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full">
      {/* Banner Carousel */}
      <div className="relative h-[180px] md:h-[280px] overflow-hidden">
        <div
          className="flex transition-transform duration-500 h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="min-w-full h-full relative"
            >
              <img
                src={banner.image}
                alt="Winter Sale Banner"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/40'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
