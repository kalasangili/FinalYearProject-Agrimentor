import React from 'react';
import DashboardLayout from "../layouts/DashboardLayout";

// Learning Card Component
const LearningCard = ({ image, title }) => (
  <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group cursor-pointer">
    <div className="h-48 overflow-hidden">
      <img 
        src={image} 
        alt={title} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
    </div>
    <div className="p-5">
      <h3 className="font-serif text-lg font-bold text-gray-800">{title}</h3>
    </div>
  </div>
);

function LearningModules() {
  const modules = [
    { title: "Soil Health", image: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=800" },
    { title: "Pest Control", image: "https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=800" },
    { title: "Irrigation Techniques", image: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?q=80&w=800" },
    { title: "Crop Varieties", image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=800" },
    { title: "Harvesting Methods", image: "https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?q=80&w=800" },
    { title: "Organic Farming", image: "https://images.unsplash.com/photo-1615485242250-717da23a54d5?q=80&w=800" },
  ];

  return (
    <DashboardLayout>

      {/* Header */}
      <header className="bg-white py-5 px-10 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <h2 className="text-2xl font-serif font-bold text-gray-800">
          Learning Modules
        </h2>
      </header>

      {/* Content */}
      <div className="p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((module, index) => (
            <LearningCard 
              key={index} 
              title={module.title} 
              image={module.image} 
            />
          ))}
        </div>
      </div>

    </DashboardLayout>
  );
}

export default LearningModules;