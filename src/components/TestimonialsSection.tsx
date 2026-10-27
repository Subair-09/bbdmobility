import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, ArrowRight, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TestimonialsSectionProps {
  onOpenReviewsModal: () => void;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  onOpenReviewsModal,
}) => {
  const testimonials = [
    {
      id: '1',
      name: 'Ngozi Eze',
      location: 'Lagos',
      avatar: '/assets/avatar-ngozi-hd.jpg',
      quote: 'BBD Mobility delivered my package within 2 hours. Super fast and professional!',
      stars: 5,
    },
    {
      id: '2',
      name: 'Tunde Adebayo',
      location: 'Lagos',
      avatar: '/assets/avatar-tunde-hd.jpg',
      quote: 'Very reliable service. I use them for my business deliveries and they never disappoint.',
      stars: 5,
    },
    {
      id: '3',
      name: 'Faith Okafor',
      location: 'Lagos',
      avatar: '/assets/avatar-faith-hd.jpg',
      quote: 'Easy booking process and great customer support. Highly recommended!',
      stars: 5,
    },
    {
      id: '4',
      name: 'Emeka Nwosu',
      location: 'Lagos',
      avatar: '/assets/avatar-tunde-hd.jpg',
      quote: 'Fragile documents arrived intact with zero delays. The courier communicated at every step.',
      stars: 5,
    },
    {
      id: '5',
      name: 'Amina Bello',
      location: 'Lagos',
      avatar: '/assets/avatar-ngozi-hd.jpg',
      quote: 'Scheduled dispatch arrived right on the dot. Outstanding service quality for e-commerce.',
      stars: 5,
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-bbd-grey/60 border-t border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header / Intro row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-3 max-w-xl text-left"
          >
            <div className="flex items-center space-x-2">
              <span className="w-6 h-[2.5px] bg-bbd-red rounded-full" />
              <span className="text-[11px] sm:text-xs font-bold tracking-widest text-bbd-navy uppercase">
                WHAT OUR CUSTOMERS SAY
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-bbd-navy tracking-tight">
              Trusted by Thousands
            </h2>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              We're proud to serve individuals, businesses and communities with reliable delivery services.
            </p>

            <div className="pt-1">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onOpenReviewsModal}
                className="inline-flex items-center justify-center px-6 py-2.5 bg-bbd-navy hover:bg-bbd-navy-light text-white text-xs sm:text-sm font-semibold rounded-full shadow-sm hover:shadow transition-all group"
              >
                <span>View More Reviews</span>
                <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </div>
          </motion.div>

          {/* Carousel Arrows */}
          <div className="flex items-center space-x-2.5 self-start md:self-auto">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={prevSlide}
              aria-label="Previous Testimonial"
              className="w-10 h-10 rounded-full bg-white border border-gray-200 text-slate-700 hover:text-bbd-navy hover:border-bbd-navy flex items-center justify-center shadow-sm transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={nextSlide}
              aria-label="Next Testimonial"
              className="w-10 h-10 rounded-full bg-white border border-gray-200 text-slate-700 hover:text-bbd-navy hover:border-bbd-navy flex items-center justify-center shadow-sm transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Desktop View: 3 cards showing active slice */}
        <div className="hidden md:grid md:grid-cols-3 gap-5">
          {[0, 1, 2].map((offset) => {
            const idx = (currentIndex + offset) % testimonials.length;
            const item = testimonials[idx];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: offset * 0.08 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between relative group"
              >
                <div className="absolute top-5 right-5 text-slate-100 group-hover:text-red-50 transition-colors pointer-events-none">
                  <Quote className="w-8 h-8 fill-current" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={item.avatar}
                      alt={`Customer ${item.name}`}
                      className="w-11 h-11 rounded-full object-cover border-2 border-red-100 shadow-xs"
                      loading="lazy"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-bbd-navy">{item.name}</h4>
                      <p className="text-xs text-slate-400">{item.location}</p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed mb-4">
                    "{item.quote}"
                  </p>
                </div>

                <div className="flex items-center space-x-1 pt-2 border-t border-slate-50 relative z-10">
                  {[...Array(item.stars)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-bbd-red text-bbd-red stroke-none"
                    />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile View: Animated Single Card Carousel with Pagination Dots */}
        <div className="block md:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card relative"
            >
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={testimonials[currentIndex].avatar}
                  alt={`Customer ${testimonials[currentIndex].name}`}
                  className="w-12 h-12 rounded-full object-cover border-2 border-red-100 shadow-xs"
                  loading="lazy"
                />
                <div>
                  <h4 className="text-sm font-bold text-bbd-navy">{testimonials[currentIndex].name}</h4>
                  <p className="text-xs text-slate-400">{testimonials[currentIndex].location}</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed mb-4">
                "{testimonials[currentIndex].quote}"
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                <div className="flex items-center space-x-1">
                  {[...Array(testimonials[currentIndex].stars)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-bbd-red text-bbd-red stroke-none"
                    />
                  ))}
                </div>
                <span className="text-[11px] font-semibold text-slate-400">
                  {currentIndex + 1} of {testimonials.length}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex justify-center items-center space-x-1.5 mt-4">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex ? 'w-6 bg-bbd-red' : 'w-2 bg-slate-300'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
