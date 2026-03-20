import React from 'react';
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { 
  BookOpen, 
  ScanSearch, 
  CloudSun, 
  Sprout, 
  TrendingUp,
  ArrowRight
} from 'lucide-react';

// Sub-component for the small info cards (Weather & Market)
const InfoCard = ({ title, children, icon: Icon, footerLink, onClick }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
    <div>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        {Icon && <Icon size={18} className="text-gray-400" />}
      </div>
      {children}
    </div>
    <button
      onClick={onClick}
      className="mt-4 text-xs text-gray-400 hover:text-green-700 flex items-center gap-1 transition-colors"
    >
      {footerLink} <ArrowRight size={12} />
    </button>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate(); // ✅ navigation hook

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="bg-white py-4 px-8 border-b border-gray-200">
        <h2 className="text-2xl font-serif font-bold text-gray-800">Dashboard</h2>
      </header>

      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Hero Banner */}
        <div className="relative h-40 rounded-xl overflow-hidden shadow-sm border border-gray-200">
          <img 
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2000" 
            alt="Agricultural Field" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-transparent flex flex-col justify-center px-10">
            <h1 className="text-3xl font-serif font-bold text-green-900 mb-1">
              Welcome to FarmFluent AI
            </h1>
            <p className="text-gray-600 text-base">
              Your intelligent partner in modern agriculture.
            </p>
          </div>
        </div>

        {/* Top Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Weather */}
          <div className="lg:col-span-3">
            <InfoCard 
              title="Today's Weather" 
              icon={CloudSun} 
              footerLink="View full forecast"
              onClick={() => navigate("/weather")}  // ✅ navigation
            >
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-gray-900">28°C</span>
                <span className="text-sm text-gray-500">Sunny with a light breeze</span>
              </div>
            </InfoCard>
          </div>

          {/* Market */}
          <div className="lg:col-span-3">
            <InfoCard 
              title="Market Watch" 
              icon={TrendingUp} 
              footerLink="View all prices"
              onClick={() => navigate("/market")}  // ✅ navigation
            >
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Wheat</span>
                  <span className="font-bold text-gray-800">$250.75</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Corn</span>
                  <span className="font-bold text-gray-800">$180.50</span>
                </div>
              </div>
            </InfoCard>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-gray-800 font-bold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              
              {/* Diagnose */}
              <button 
                onClick={() => navigate("/disease")}  // ✅ navigation
                className="flex items-center justify-center gap-2 bg-[#edf4e8] text-green-900 py-4 px-4 rounded-lg font-medium hover:bg-green-100 transition-colors"
              >
                <ScanSearch size={18} />
                Diagnose Crop
              </button>

              {/* Rotation */}
              <button 
                onClick={() => navigate("/rotation")} // ✅ navigation
                className="flex items-center justify-center gap-2 bg-[#edf4e8] text-green-900 py-4 px-4 rounded-lg font-medium hover:bg-green-100 transition-colors"
              >
                <Sprout size={18} />
                Rotation Advice
              </button>

            </div>
          </div>
        </div>

        {/* Learning Module */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-800 font-bold mb-6">Featured Learning Module</h3>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-64 h-40 shrink-0 rounded-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=800" 
                className="w-full h-full object-cover"
                alt="Soil health"
              />
            </div>
            <div className="flex flex-col justify-between py-1">
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Mastering Soil Health</h4>
                <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">
                  Learn the fundamentals of soil composition, nutrient management, and how to improve soil fertility for better yields.
                </p>
              </div>
              <button 
                onClick={() => navigate("/learning")} // ✅ navigation
                className="mt-6 flex items-center gap-2 bg-green-800 text-white px-5 py-2.5 rounded-md text-sm font-medium w-fit hover:bg-green-900 transition-colors"
              >
                <BookOpen size={16} />
                Explore All Modules
              </button>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;