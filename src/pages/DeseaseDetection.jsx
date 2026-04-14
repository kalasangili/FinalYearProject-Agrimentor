import React, { useState, useRef } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Upload, Leaf, AlertCircle, CheckCircle2, Bot, RefreshCw, Info, ChevronDown } from 'lucide-react';
import { analyzeDisease } from '../services/api';

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const DiseaseDetection = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    setError(null);
    setResult(null);

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please upload a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setImageFile(file);
    setSelectedImage(URL.createObjectURL(file));
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setShowSuggestions(false);
    try {
      // Send the File object directly - api service handles FormData conversion
      const data = await analyzeDisease(imageFile);
      setResult(data);
    } catch (err) {
      console.error('Analysis error:', err);
      const res = err.data || {};
      const msg = res.error || err.message || 'Analysis failed. Make sure the ML microservice is running.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImageFile(null);
    setResult(null);
    setError(null);
    setShowSuggestions(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#FDFDE6] p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-serif font-bold text-green-900">
              Crop Disease Detection
            </h1>
            <p className="text-green-700 mt-2">Identify plant diseases instantly using AI-powered image analysis.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Upload Section */}
            <section className="bg-white rounded-2xl border border-green-100 p-6 md:p-8 shadow-sm flex flex-col">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Upload size={20} className="text-green-600" />
                  Upload Leaf Image
                </h2>
                <p className="text-sm text-gray-500 mt-1">For best results, ensure the leaf is well-lit and clearly visible.</p>
              </div>

              <div 
                className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl transition-all cursor-pointer group min-h-[300px] ${
                  selectedImage ? 'border-green-200 bg-green-50/30' : 'border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50'
                }`}
                onClick={() => !loading && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept={ALLOWED_TYPES.join(',')}
                  onChange={handleImageUpload}
                />
                
                {!selectedImage ? (
                  <div className="flex flex-col items-center p-10 text-center">
                    <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="text-green-600" size={32} />
                    </div>
                    <p className="text-gray-700 font-semibold text-lg">Click to select a photo</p>
                    <p className="text-sm text-gray-500 mt-1">or drag and drop here</p>
                    <div className="mt-6 flex gap-2">
                      {['JPG', 'PNG', 'WEBP'].map(ext => (
                        <span key={ext} className="px-2 py-1 bg-white border border-gray-200 rounded text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          {ext}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full p-4 flex flex-col items-center">
                    <div className="relative group w-full aspect-square max-h-[300px] rounded-xl overflow-hidden shadow-md bg-white">
                      <img 
                        src={selectedImage} 
                        alt="Selected leaf" 
                        className="w-full h-full object-contain" 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white font-medium text-sm">Change Image</p>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleReset(); }}
                      className="mt-4 text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove Photo
                    </button>
                  </div>
                )}
              </div>

              <button
                disabled={!selectedImage || loading}
                onClick={(e) => { e.stopPropagation(); handleAnalyze(); }}
                className={`mt-8 w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all ${
                  selectedImage && !loading
                    ? 'bg-green-700 text-white hover:bg-green-800 shadow-lg shadow-green-100 active:scale-[0.98]'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw size={22} className="animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Bot size={22} />
                    Detect Disease
                  </>
                )}
              </button>
            </section>

            {/* Right: Results Section */}
            <section className="bg-white rounded-2xl border border-green-100 p-6 md:p-8 shadow-sm flex flex-col min-h-[500px]">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-green-600" />
                  Analysis Results
                </h2>
                <p className="text-sm text-gray-500 mt-1">Detailed findings and expert recommendations.</p>
              </div>

              {error && (
                <div className="p-5 rounded-2xl border-2 border-red-100 bg-red-50 text-red-700 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-start gap-4">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <AlertCircle size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-lg mb-1">Analysis Error</p>
                      <p className="text-sm leading-relaxed">{error}</p>
                      <button 
                        onClick={handleAnalyze}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {loading && !result && (
                <div className="flex-1 flex flex-col items-center justify-center py-12 space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-200 rounded-full blur-2xl animate-pulse opacity-50" />
                    <div className="relative bg-white p-6 rounded-full shadow-sm border border-green-50">
                      <Bot size={64} className="text-green-600 animate-bounce" />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-bold text-gray-800">Processing Image...</h3>
                    <p className="text-sm text-gray-500 max-w-[240px]">Our AI is identifying patterns and potential diseases on your leaf sample.</p>
                  </div>
                  <div className="w-full max-w-xs bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-green-600 h-full w-1/2 animate-[progress_2s_ease-in-out_infinite]" style={{ width: '40%' }} />
                  </div>
                </div>
              )}

              {result && !loading && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  {/* Primary Result Card */}
                  <div className={`p-6 rounded-2xl border-2 transition-colors ${
                    result.healthy ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'
                  }`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${result.healthy ? 'bg-green-100' : 'bg-amber-100'}`}>
                          {result.healthy ? (
                            <CheckCircle2 size={28} className="text-green-700" />
                          ) : (
                            <AlertCircle size={28} className="text-amber-700" />
                          )}
                        </div>
                        <div>
                          <h3 className={`text-xl font-bold ${result.healthy ? 'text-green-900' : 'text-amber-900'}`}>
                            {result.healthy ? 'Healthy Plant' : result.disease}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Confidence</span>
                            <div className="h-1.5 w-24 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${result.confidence > 80 ? 'bg-green-600' : 'bg-amber-500'}`}
                                style={{ width: `${result.confidence}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-gray-700">{result.confidence}%</span>
                          </div>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-white/50 border border-black/5 rounded-full text-[10px] font-bold text-gray-600 uppercase">
                        {result.plant}
                      </span>
                    </div>

                    <div className="space-y-4 mt-6">
                      <div className="bg-white/60 p-4 rounded-xl">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                          <Info size={12} /> Diagnosis Details
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {result.details || 'Based on the visual patterns, the plant appears to be in its current state.'}
                        </p>
                      </div>

                      <div className={`p-4 rounded-xl ${result.healthy ? 'bg-green-600 text-white' : 'bg-amber-600 text-white'} shadow-md shadow-black/5`}>
                        <h4 className="text-xs font-bold opacity-80 uppercase tracking-widest mb-2">Recommended Action</h4>
                        <p className="text-sm font-medium leading-relaxed">
                          {result.treatment}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Top-3 Predictions */}
                  {result.suggestions && result.suggestions.length > 1 && (
                    <div className="border-t border-gray-100 pt-6">
                      <button
                        onClick={() => setShowSuggestions(!showSuggestions)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-sm font-bold text-gray-700">Top-3 AI Predictions</span>
                        <ChevronDown size={18} className={`text-gray-400 transition-transform ${showSuggestions ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {showSuggestions && (
                        <div className="mt-3 space-y-3 animate-in slide-in-from-top-2">
                          {result.suggestions.slice(0, 3).map((s, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                              <span className={`text-sm font-medium ${i === 0 ? 'text-green-700 font-bold' : 'text-gray-600'}`}>
                                {s.name}
                              </span>
                              <div className="flex items-center gap-3">
                                <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${i === 0 ? 'bg-green-600' : 'bg-gray-300'}`}
                                    style={{ width: `${s.confidence}%` }}
                                  />
                                </div>
                                <span className="text-xs font-mono text-gray-400 w-8">{s.confidence}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <button 
                    onClick={handleReset} 
                    className="w-full py-3 text-sm text-green-700 hover:bg-green-50 rounded-xl font-bold transition-colors border border-green-100"
                  >
                    Analyze New Image
                  </button>
                </div>
              )}

              {!loading && !result && !error && (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-10 py-20">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <Bot size={48} className="text-gray-200" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-700 mb-2">Ready for Analysis</h3>
                  <p className="text-gray-400 text-sm max-w-[260px]">
                    Upload a photo of a plant leaf to receive a diagnosis and treatment plan.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}} />
    </DashboardLayout>
  );
};

export default DiseaseDetection;
