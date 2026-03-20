import React from 'react';
import DashboardLayout from "../layouts/DashboardLayout";
import { TrendingUp, TrendingDown, ChevronRight } from "lucide-react";

const MarketPrices = () => {
  const commodityData = [
    { crop: "Wheat", price: "$250.75", change: "1.20", trend: "up" },
    { crop: "Corn", price: "$180.50", change: "-0.80", trend: "down" },
    { crop: "Soybeans", price: "$420.00", change: "2.50", trend: "up" },
    { crop: "Cotton", price: "$0.85", change: "0.01", trend: "up" },
    { crop: "Barley", price: "$160.25", change: "-1.10", trend: "down" },
    { crop: "Rice", price: "$300.00", change: "0.50", trend: "up" },
  ];

  return (
    <DashboardLayout>
      {/* Header - Matches Weather.jsx Header Style */}
      <header className="bg-white py-4 px-8 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">Market Prices</h1>
      </header>

      {/* Page Content Container - Matches Weather.jsx Padding */}
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        
        {/* Commodity Prices Card */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50">
            <h2 className="text-xl font-bold text-gray-800">Commodity Prices</h2>
            <p className="text-sm text-gray-400 mt-1">Live market prices for major agricultural commodities.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-[11px] font-bold uppercase tracking-widest bg-gray-50/50">
                  <th className="px-8 py-4">Crop</th>
                  <th className="px-8 py-4 text-right">Price (USD)</th>
                  <th className="px-8 py-4 text-right">Change</th>
                  <th className="px-8 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {commodityData.map((item, index) => (
                  <tr key={index} className="hover:bg-[#f6f9ef] transition-colors group cursor-default">
                    <td className="px-8 py-5 font-medium text-gray-800">{item.crop}</td>
                    <td className="px-8 py-5 text-right font-bold text-gray-900">{item.price}</td>
                    <td className="px-8 py-5 text-right">
                      <div className={`inline-flex items-center gap-1 font-bold ${
                        item.trend === 'up' ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {item.change}
                        {item.trend === 'up' ? (
                          <TrendingUp size={16} />
                        ) : (
                          <TrendingDown size={16} />
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <ChevronRight size={18} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity inline" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Market Status Note (Optional - for UI Balance) */}
        <div className="bg-[#e4eed4] p-4 rounded-xl border border-green-100 flex items-center justify-center">
            <p className="text-xs text-green-800 font-medium uppercase tracking-wider">
                Prices are updated every 15 minutes based on global exchange rates
            </p>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default MarketPrices;