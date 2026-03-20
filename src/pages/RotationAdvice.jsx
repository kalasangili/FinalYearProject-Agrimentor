import React, { useState } from 'react';
import DashboardLayout from "../layouts/DashboardLayout";
import { Sprout } from "lucide-react";

const RotationAdvice = () => {
  const [formData, setFormData] = useState({
    soil: "",
    season: "",
    history: ""
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};
    
    // Logic to check for "wrong" or insufficient information
    if (formData.soil.length < 5) {
      newErrors.soil = "Please describe your soil conditions in more detail.";
    }
    if (!formData.season) {
      newErrors.season = "Please select a season.";
    }
    if (formData.history.length < 5) {
      newErrors.history = "Please provide some crop history.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGetAdvice = (e) => {
    e.preventDefault();
    if (validateForm()) {
      alert("Fetching your personalized AI advice...");
    }
  };

  return (
    <DashboardLayout>
      {/* Header Matches Dashboard and Weather Style */}
      <header className="bg-white py-4 px-8 border-b border-gray-200">
        <h1 className="text-2xl font-serif font-bold text-gray-800 tracking-tight">
          Crop Rotation Advice
        </h1>
      </header>

      <div className="p-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Farm Details Form */}
        <section className="flex-1 bg-white rounded-xl border border-gray-200 p-8 shadow-sm h-fit">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Farm Details</h2>
          <p className="text-sm text-gray-400 mb-8">Provide details about your farm for personalized advice.</p>

          <form onSubmit={handleGetAdvice} className="space-y-6">
            {/* Soil Conditions Input */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${errors.soil ? 'text-red-500' : 'text-gray-700'}`}>
                Soil Conditions
              </label>
              <input
                type="text"
                placeholder="e.g., Loamy, well-drained, pH 6.5"
                className={`w-full p-3 rounded-lg border bg-[#f6f9ef] outline-none transition-all ${
                  errors.soil ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-200 focus:border-green-400'
                }`}
                value={formData.soil}
                onChange={(e) => setFormData({...formData, soil: e.target.value})}
              />
              {errors.soil && <p className="text-red-500 text-xs mt-2 italic">{errors.soil}</p>}
            </div>

            {/* Current Season Dropdown */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${errors.season ? 'text-red-500' : 'text-gray-700'}`}>
                Current Season
              </label>
              <select
                className={`w-full p-3 rounded-lg border bg-[#f6f9ef] outline-none ${
                  errors.season ? 'border-red-400' : 'border-gray-200'
                }`}
                value={formData.season}
                onChange={(e) => setFormData({...formData, season: e.target.value})}
              >
                <option value="">Select a season</option>
                <option value="Summer">Summer</option>
                <option value="Winter">Winter</option>
                <option value="Monsoon">Monsoon</option>
              </select>
              {errors.season && <p className="text-red-500 text-xs mt-2 italic">{errors.season}</p>}
            </div>

            {/* Crop History Textarea */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${errors.history ? 'text-red-500' : 'text-gray-700'}`}>
                Crop History (last 2-3 years)
              </label>
              <textarea
                placeholder="e.g., 2023: Corn, 2022: Soybeans, 2021: Wheat"
                rows="4"
                className={`w-full p-3 rounded-lg border bg-[#f6f9ef] outline-none resize-none transition-all ${
                  errors.history ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-200 focus:border-green-400'
                }`}
                value={formData.history}
                onChange={(e) => setFormData({...formData, history: e.target.value})}
              />
              {errors.history && <p className="text-red-500 text-xs mt-2 italic">{errors.history}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#5b7548] hover:bg-[#4a613a] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              <Sprout size={18} />
              Get Advice
            </button>
          </form>
        </section>

        {/* Right Column: AI Recommendations Placeholder */}
        <section className="flex-1 bg-white rounded-xl border border-gray-200 p-8 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 text-left mb-2">AI Recommendations</h2>
            <p className="text-sm text-gray-400 text-left">Personalized crop rotation strategies and predictions.</p>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <Sprout size={64} className="text-[#4a613a] opacity-60 mb-6" strokeWidth={1.5} />
            <p className="text-gray-500 max-w-xs">
              Fill out your farm details to receive expert advice.
            </p>
          </div>
        </section>

      </div>
    </DashboardLayout>
  );
};

export default RotationAdvice;