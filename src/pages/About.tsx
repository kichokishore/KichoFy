// src/pages/About.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiAward as Award,
  FiUsers as Users,
  FiHeart as Heart,
  FiTruck as Truck,
  FiShield as Shield,
  FiStar as Star
} from 'react-icons/fi';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export const About: React.FC = () => {
  const values = [
    {
      icon: Heart,
      title: 'Passion for Fashion',
      description: 'We are passionate about bringing you the latest trends and timeless classics that make you feel confident and beautiful.'
    },
    {
      icon: Award,
      title: 'Quality First',
      description: 'Every product is carefully selected and quality-tested to ensure you receive only the best fabrics and craftsmanship.'
    },
    {
      icon: Users,
      title: 'Community Focused',
      description: 'We believe in empowering women by creating a supportive community where style meets confidence.'
    },
    {
      icon: Shield,
      title: 'Trust & Reliability',
      description: 'Your trust is our foundation. We ensure secure shopping, authentic products, and reliable customer service.'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Happy Customers' },
    { number: '1000+', label: 'Products' },
    { number: '4.9', label: 'Average Rating' },
    { number: '5+', label: 'Years of Excellence' }
  ];

  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto px-4"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={itemVariants} className="animate-slideIn">
              <h1 className="text-5xl lg:text-6xl font-heading font-bold text-gray-900 dark:text-white mb-6">
                About <span className="elegant-text text-primary">KichoFy</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Born from a passion for empowering women through fashion, KichoFy is your destination for 
                discovering styles that celebrate your unique personality and confidence.
              </p>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 bg-primary rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold"
                      >
                        {i}
                      </div>
                    ))}
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">50K+ Happy Customers</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="relative">
              <img
                src="https://images.pexels.com/photos/9503742/pexels-photo-9503742.jpeg"
                alt="About KichoFy"
                className="w-full h-[500px] object-cover rounded-3xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl">
                <div className="flex items-center space-x-3">
                  <Star className="text-yellow-400 fill-current" size={24} />
                  <div>
                    <div className="font-bold text-2xl text-gray-900 dark:text-white">4.9</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Customer Rating</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto px-4"
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div variants={itemVariants}>
              <h2 className="text-4xl font-heading font-bold text-gray-900 dark:text-white mb-8">
                Our Story
              </h2>
            </motion.div>
            <motion.div variants={itemVariants} className="prose prose-lg text-gray-600 dark:text-gray-400 max-w-none">
              <p className="mb-6 leading-relaxed">
                KichoFy was founded in 2019 with a simple yet powerful vision: to make every woman feel 
                beautiful, confident, and authentically herself through fashion. What started as a small 
                collection of handpicked ethnic wear has evolved into a comprehensive fashion destination 
                that celebrates the diversity and beauty of Indian women.
              </p>
              <p className="mb-6 leading-relaxed">
                Our name "KichoFy" combines the essence of "choice" and "beauty" - reflecting our commitment 
                to providing you with beautiful choices that resonate with your personal style. We believe 
                that fashion is not just about clothing; it's about expressing your identity, your mood, 
                and your aspirations.
              </p>
              <p className="leading-relaxed">
                Today, we serve thousands of customers across India, offering everything from traditional 
                ethnic wear to contemporary western fashion. Our journey is driven by your trust, your 
                feedback, and your continued support in helping us grow into the brand we are today.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto px-4"
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-gray-900 dark:text-white mb-4">
              Our Values
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              These principles guide everything we do, from product selection to customer service
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center"
              >
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <value.icon className="text-primary" size={28} />
                </div>
                <h3 className="font-heading text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Statistics */}
      <section className="py-20 bg-primary">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto px-4"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center text-white"
              >
                <div className="text-4xl lg:text-5xl font-bold mb-2 animate-pulse-subtle">
                  {stat.number}
                </div>
                <div className="text-white/90 text-lg">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Our Promise */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto px-4"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={itemVariants}>
              <h2 className="text-4xl font-heading font-bold text-gray-900 dark:text-white mb-8">
                Our Promise to You
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Award className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Quality Assurance
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Every product undergoes rigorous quality checks to ensure you receive only the finest materials and craftsmanship.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Truck className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Fast & Secure Delivery
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Quick, secure delivery with tracking, plus easy returns if you're not completely satisfied.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Users className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Customer-First Approach
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Your satisfaction is our priority. Our customer service team is always ready to help with any questions or concerns.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
              <img
                src="https://images.pexels.com/photos/9503743/pexels-photo-9503743.jpeg"
                alt="Our Promise 1"
                className="w-full h-64 object-cover rounded-2xl shadow-lg"
              />
              <img
                src="https://images.pexels.com/photos/9503744/pexels-photo-9503744.jpeg"
                alt="Our Promise 2"
                className="w-full h-64 object-cover rounded-2xl shadow-lg mt-8"
              />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-light">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto px-4 text-center"
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl font-heading font-bold text-white mb-6">
              Join Our Fashion Journey
            </h2>
            <p className="text-white/90 text-xl mb-8 max-w-2xl mx-auto">
              Become part of the KichoFy community and discover fashion that celebrates your unique style
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors">
              Start Shopping
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-primary transition-colors">
              Join Newsletter
            </button>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default About;