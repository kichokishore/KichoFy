import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const phoneNumber = "916374288038";
  const message = "Hello! I want to order your product.";
  const waLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="text-2xl font-heading font-bold text-primary">
              <span className="elegant-text text-3xl">KichoFy</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Discover your perfect style with our curated collection of women's fashion.
              From ethnic to western wear, we bring you the latest trends and timeless classics.
            </p>
            <div className="flex space-x-4">
              {/* <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Facebook size={20} />
              </a> */}
              <a href="https://www.instagram.com/kichofy?igsh=MTJwNXAzZWtzd3Z5cg==" target='_blank' className="text-gray-400 hover:text-primary transition-colors">
                <Instagram size={20} />
              </a>
              {/* <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Twitter size={20} />
              </a> */}
              {/* <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Youtube size={20} />
              </a> */}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-primary transition-colors">
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link to="/collections" className="text-gray-400 hover:text-primary transition-colors">
                  {t('collections')}
                </Link>
              </li>
              <li>
                <Link to="/new-arrivals" className="text-gray-400 hover:text-primary transition-colors">
                  {t('newArrivals')}
                </Link>
              </li>
              <li>
                <Link to="/best-sellers" className="text-gray-400 hover:text-primary transition-colors">
                  {t('bestSellers')}
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-gray-400 hover:text-primary transition-colors">
                  {t('orders')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('customerService')}</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  Size Guide
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  Return Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin size={16} className="text-primary" />
                <span className="text-gray-400 text-sm">Vellore district, Tamil nadu, India</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={16} className="text-primary" />
                <span className="text-gray-400 text-sm"><a href={waLink} target='_blank'>+91 6374288038</a></span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-primary" />

                <span className="text-gray-400 text-sm"><a href="mailto:kichofy@gmail.com" target='_blank'>kichofy@gmail.com</a></span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h4 className="text-lg font-semibold mb-2">Stay Updated</h4>
              <p className="text-gray-400 text-sm">Subscribe to get special offers and updates</p>
            </div>

            <div className="flex flex-col sm:flex-row w-full max-w-md">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button className="px-6 py-2 mt-2 sm:mt-0 bg-primary hover:bg-primary-light transition-colors rounded-b-lg sm:rounded-l-none sm:rounded-r-lg font-medium">
                Subscribe
              </button>
            </div>
          </div>
        </div>


        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-6 text-center">
          <p className="text-gray-400 text-sm">{t('copyright')}</p>
        </div>
      </div>
    </footer>
  );
};