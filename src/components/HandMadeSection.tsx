import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { productsService } from '../utils/databaseService';

export const HandMadeSection: React.FC = () => {
  const [handmadeProducts, setHandmadeProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadHandmadeProducts = async () => {
      try {
        const products = await productsService.getProducts({
          category: 'handmade',
          limit: 4
        });
        setHandmadeProducts(products);
      } catch (error) {
        console.error('Error loading handmade products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHandmadeProducts();
  }, []);


  return (
    <section 
      ref={sectionRef}
      className="relative py-8 flex items-center justify-center overflow-hidden"
    >
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          poster="/api/placeholder/1920/1080" // Fallback image
        >
          {/* You'll need to replace these with actual video files */}
          <source src="\src\assets\video.mp4" type="video/mp4" />
          {/* <source src="/assets/video.webm" type="video/webm" /> */}
          {/* Fallback image if video doesn't load */}
          <img 
            src="/api/placeholder/1920/1080" 
            alt="Handmade craftsmanship background"
            className="w-full h-full object-cover"
          />
        </video>
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60"></div>
      </div>

      {/* Main Content with Parallax */}
      <div className="container mx-auto px-4 relative z-10">
        {/* Parallax Text Section */}
        <div 
          ref={textRef}
          className="text-center text-white mb-16 transition-transform duration-100"
        >
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="text-amber-300 mr-3" size={28} />
            <h2 className="text-5xl md:text-7xl font-light tracking-tight">
              Hand Crafted
            </h2>
            <Sparkles className="text-amber-300 ml-3" size={28} />
          </div>
          
          <p className="text-xl md:text-2xl text-amber-100 font-light mb-8 max-w-3xl mx-auto leading-relaxed">
            Passion + Precision = கலாட்டா collection!
          </p>

        </div>

        {/* Products Grid - Modern Cards */}
        {!loading && handmadeProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {handmadeProducts.map((product, index) => (
              <div
                key={product.id}
                className="group relative bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:border-amber-300/50 transition-all duration-500 overflow-hidden hover:transform hover:scale-105"
                style={{
                  animationDelay: `${index * 200}ms`,
                }}
              >
                {/* Product Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={product.image_url || '/api/placeholder/400/300'}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Handmade Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-amber-500 text-white px-3 py-2 rounded-full text-sm font-semibold flex items-center backdrop-blur-sm">
                      <Sparkles size={14} className="mr-2" />
                      Handmade
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="font-semibold text-white mb-3 text-lg line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-amber-100 text-sm mb-4 line-clamp-2 opacity-90">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-amber-300">
                        ₹{product.price}
                      </span>
                      {product.original_price && product.original_price > product.price && (
                        <span className="text-sm text-amber-200/70 line-through">
                          ₹{product.original_price}
                        </span>
                      )}
                    </div>
                    
                    {product.is_new && (
                      <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-medium border border-green-500/30">
                        New
                      </span>
                    )}
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 border-2 border-amber-300/0 group-hover:border-amber-300/30 rounded-2xl transition-all duration-300 pointer-events-none" />
              </div>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 animate-pulse"
              >
                <div className="w-full h-64 bg-white/20 rounded-lg mb-4"></div>
                <div className="h-6 bg-white/20 rounded mb-3"></div>
                <div className="h-4 bg-white/20 rounded mb-4"></div>
                <div className="h-8 bg-white/20 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 max-w-4xl mx-auto">
            <h3 className="text-3xl font-light text-white mb-6">
              Crafted with Purpose, Made with Love
            </h3>
            <p className="text-amber-100 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              Handcrafted excellence… கைவினை நிபுணத்துவம்!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products?category=handmade"
                className="inline-flex items-center px-5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 group"
              >
                Collection
                <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center px-5 py-2 border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold rounded-lg transition-all duration-300"
              >
                Meet Our Artisans
              </Link>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};