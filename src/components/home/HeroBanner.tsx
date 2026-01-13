import React, { useState, useEffect } from 'react';

const banners = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&h=400&fit=crop',
    gradient: 'from-pink-400 via-pink-300 to-blue-300',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop',
    gradient: 'from-blue-400 via-cyan-300 to-teal-300',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop',
    gradient: 'from-purple-400 via-pink-300 to-red-300',
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
              className={`min-w-full h-full relative bg-gradient-to-r ${banner.gradient}`}
            >
              <img
                src={banner.image}
                alt="Sale Banner"
                className="w-full h-full object-cover mix-blend-overlay opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
                    SALE IS NOW LIVE
                  </h2>
                  <p className="text-lg md:text-2xl text-white/90 mt-2">Up to 95% OFF</p>
                </div>
              </div>
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
