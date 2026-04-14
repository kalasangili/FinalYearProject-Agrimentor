import React from 'react';
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Bot, // Used for Disease Detection
  ScanLine, // Used for AR Scanner
  CloudSun,
  Sprout,
  TrendingUp
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, to }) => (
  <NavLink to={to}>
    {({ isActive }) => (
      <div
        className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-all duration-200 ${
          isActive
            ? "bg-[#edf4e8] text-green-900 shadow-sm"
            : "text-gray-600 hover:bg-gray-100/50 hover:text-gray-900"
        }`}
      >
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
        <span className={`text-sm ${isActive ? "font-bold" : "font-medium"}`}>
          {label}
        </span>
      </div>
    )}
  </NavLink>
);

function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-[#e4eed4] border-r border-gray-200/50 flex flex-col z-50">
      
      {/* Logo Section - FarmFluent AI */}
      <div className="p-6 mb-2 flex items-center gap-3">
        <div className="bg-[#5d7c47] p-2 rounded-xl shadow-md">
          <Sprout className="text-white" size={24} />
        </div>
        <h1 className="text-xl font-serif font-bold text-[#3a4d2e] tracking-tight">
          AgriMentor
        </h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col gap-1 px-2">
        <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/" />
        <SidebarItem icon={Bot} label="Disease Detection" to="/disease" />
        <SidebarItem icon={ScanLine} label="AR Scanner" to="/ar-scanner" />
        <SidebarItem icon={Sprout} label="Rotation Advice" to="/rotation" />
        <SidebarItem icon={CloudSun} label="Weather" to="/weather" />
        <SidebarItem icon={TrendingUp} label="Market Prices" to="/market" />
        <SidebarItem icon={BookOpen} label="Learning Modules" to="/learning" />
      </nav>

      {/* Optional: User Profile at bottom can go here if needed */}
    </aside>
  );
}

export default Sidebar;