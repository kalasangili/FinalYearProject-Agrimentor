import React, { useState } from 'react';
import DashboardLayout from "../layouts/DashboardLayout"; // Import your layout
import { 
  Upload, 
  Bot, 
  Leaf, 
  AlertCircle 
} from 'lucide-react';

const DiseaseDetection = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#FDFDE6] p-8">
        {/* Page Title */}
        <h1 className="text-3xl font-serif font-bold text-green-900 mb-8 px-2">
          Crop Disease Detection
        </h1>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Upload Section */}
          <section className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm flex flex-col">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800">Upload Leaf Image</h2>
              <p className="text-sm text-gray-500">Upload a clear photo of a crop's leaf for AI analysis.</p>
            </div>

            {/* Upload Dropzone */}
            <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group min-h-[300px]">
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload} 
              />
              <div className="flex flex-col items-center py-10">
                <Upload className="text-gray-400 group-hover:text-green-600 mb-4 transition-colors" size={48} strokeWidth={1.5} />
                <p className="text-gray-700 font-medium">
                  <span className="text-green-700">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">PNG, JPG, or JPEG</p>
              </div>
            </label>

            {/* Preview Image Slot */}
            {selectedImage && (
              <div className="mt-6 p-4 bg-[#e4eed4] rounded-lg border border-green-200">
                <div className="relative h-64 w-full rounded-md overflow-hidden shadow-inner bg-white flex items-center justify-center">
                  <img 
                    src={selectedImage} 
                    alt="Selected leaf" 
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* Action Button */}
            <button 
              disabled={!selectedImage || isAnalyzing}
              onClick={() => setIsAnalyzing(true)}
              className={`mt-6 w-full py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                selectedImage 
                  ? "bg-green-800 text-white hover:bg-green-900 shadow-md" 
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Leaf size={20} />
              {isAnalyzing ? "Analyzing Texture..." : "Analyze Image"}
            </button>
          </section>

          {/* Right Column: Analysis Results */}
          <section className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm flex flex-col min-h-[500px]">
            <div className="mb-6 text-left">
              <h2 className="text-xl font-bold text-gray-800">Analysis Results</h2>
              <p className="text-sm text-gray-500">The AI's diagnosis and treatment suggestions will appear here.</p>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center px-10">
              {!isAnalyzing ? (
                <>
                  <div className="bg-gray-50 p-6 rounded-full mb-6">
                    <Bot size={64} className="text-gray-300" strokeWidth={1} />
                  </div>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    Your crop health analysis is just an upload away.
                  </p>
                </>
              ) : (
                <div className="w-full space-y-6">
                  <div className="flex items-center gap-4 text-green-700 animate-pulse">
                    <AlertCircle size={24} />
                    <span className="font-bold text-lg">Processing Neural Network...</span>
                  </div>
                  <div className="h-4 bg-gray-100 rounded w-full"></div>
                  <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                  <div className="h-24 bg-gray-50 rounded-lg border border-dashed border-gray-200"></div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DiseaseDetection;