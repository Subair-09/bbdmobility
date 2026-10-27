import React from 'react';
import { FileText, ShoppingCart, Package, ShoppingBag, Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ServicesSectionProps {
  onSelectService: (serviceName: string) => void;
  onOpenAllServices: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onSelectService,
  onOpenAllServices,
}) => {
  const services = [
    {
      id: 'docs',
      name: 'Documents & Files',
      description: 'Contracts, papers, forms and more.',
      icon: FileText,
    },
    {
      id: 'food',
      name: 'Food & Groceries',
      description: 'Fresh food, groceries and essentials.',
      icon: ShoppingCart,
    },
    {
      id: 'ecommerce',
      name: 'E-commerce Packages',
      description: 'Online orders and retail items.',
      icon: Package,
    },
    {
      id: 'personal',
      name: 'Personal Items',
      description: 'Gifts, valuables and more.',
      icon: ShoppingBag,
    },
    {
      id: 'scheduled',
      name: 'Same-Day & Scheduled',
      description: 'Book now or schedule for later.',
      icon: Calendar,
    },
  ];

  return (
    <section id="services" className="py-12 sm:py-16 lg:py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Intro Block */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-4 xl:col-span-3 space-y-4 text-left"
          >
            <div className="flex items-center space-x-2">
              <span className="w-6 h-[2.5px] bg-bbd-red rounded-full" />
              <span className="text-[11px] sm:text-xs font-bold tracking-widest text-bbd-navy uppercase">
                OUR SERVICES
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-bbd-navy tracking-tight leading-tight">
              What We Deliver
            </h2>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-sm">
              From important documents to daily essentials, BBD Mobility delivers with speed and care.
            </p>

            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onOpenAllServices}
                className="inline-flex items-center justify-center px-6 py-2.5 bg-bbd-red hover:bg-bbd-red-hover active:bg-bbd-red-hover text-white text-xs sm:text-sm font-bold rounded-full shadow-sm hover:shadow transition-all group"
              >
                <span>View All Services</span>
                <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </div>
          </motion.div>

          {/* Right Service Cards */}
          <div className="lg:col-span-8 xl:col-span-9">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
              {services.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ duration: 0.4, delay: index * 0.07 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onSelectService(item.name)}
                    className="group bg-white rounded-xl p-4 sm:p-5 border border-gray-100 hover:border-bbd-red/30 shadow-sm hover:shadow-card-hover transition-all duration-300 flex flex-col items-center text-center cursor-pointer min-h-[160px] sm:min-h-[175px] justify-between relative overflow-hidden"
                  >
                    {/* Top accent line on hover */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-bbd-red scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-50 flex items-center justify-center text-bbd-navy group-hover:text-bbd-red group-hover:bg-red-50/60 transition-colors my-1 shadow-xs">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
                    </div>

                    <div className="w-full">
                      <h3 className="text-xs sm:text-sm font-bold text-bbd-navy group-hover:text-bbd-red transition-colors mb-1 line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-slate-500 leading-tight">
                        {item.description}
                      </p>
                    </div>

                    <span className="text-[10px] font-semibold text-bbd-navy/60 group-hover:text-bbd-red mt-2 inline-flex items-center gap-0.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      Book this <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
