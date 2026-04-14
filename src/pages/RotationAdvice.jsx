import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Sprout, ChevronRight, AlertCircle, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getRotationAdvice } from '../services/api';

const RotationAdvice = () => {
  const [formData, setFormData] = useState({ soil: '', season: '', history: '' });
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    if (formData.soil.trim().length < 3) {
      newErrors.soil = 'Describe soil conditions (e.g. loamy, clay, well-drained)';
    }
    if (!formData.season) {
      newErrors.season = 'Select a season';
    }
    if (formData.history.trim().length < 5) {
      newErrors.history = 'Provide crop history (e.g. 2023: Corn, 2022: Soybeans)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGetAdvice = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await getRotationAdvice({
        soil: formData.soil,
        season: formData.season,
        history: formData.history,
      });
      setResult(data);
    } catch (err) {
      setError(err.data?.error || err.message || 'Failed to get advice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <header className="bg-white py-4 px-8 border-b border-gray-200">
        <h1 className="text-2xl font-serif font-bold text-gray-800 tracking-tight">
          Crop Rotation Advice
        </h1>
      </header>

      <div className="p-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Form */}
        <section className="flex-1 bg-white rounded-xl border border-gray-200 p-8 shadow-sm h-fit">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Farm Details</h2>
          <p className="text-sm text-gray-400 mb-8">Provide details for personalized advice.</p>

          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleGetAdvice} className="space-y-6">
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
                onChange={(e) => setFormData({ ...formData, soil: e.target.value })}
              />
              {errors.soil && <p className="text-red-500 text-xs mt-2">{errors.soil}</p>}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${errors.season ? 'text-red-500' : 'text-gray-700'}`}>
                Current Season
              </label>
              <select
                className={`w-full p-3 rounded-lg border bg-[#f6f9ef] outline-none ${
                  errors.season ? 'border-red-400' : 'border-gray-200'
                }`}
                value={formData.season}
                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
              >
                <option value="">Select a season</option>
                <option value="Summer">Summer</option>
                <option value="Winter">Winter</option>
                <option value="Monsoon">Monsoon</option>
                <option value="Spring">Spring</option>
                <option value="Fall">Fall</option>
              </select>
              {errors.season && <p className="text-red-500 text-xs mt-2">{errors.season}</p>}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${errors.history ? 'text-red-500' : 'text-gray-700'}`}>
                Crop History (last 2–3 years)
              </label>
              <textarea
                placeholder="e.g., 2023: Corn, 2022: Soybeans, 2021: Wheat"
                rows="4"
                className={`w-full p-3 rounded-lg border bg-[#f6f9ef] outline-none resize-none transition-all ${
                  errors.history ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-200 focus:border-green-400'
                }`}
                value={formData.history}
                onChange={(e) => setFormData({ ...formData, history: e.target.value })}
              />
              {errors.history && <p className="text-red-500 text-xs mt-2">{errors.history}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5b7548] hover:bg-[#4a613a] disabled:opacity-70 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Getting advice...
                </>
              ) : (
                <>
                  <Sprout size={18} />
                  Get Advice
                </>
              )}
            </button>
          </form>
        </section>

        {/* Results */}
        <section className="flex-1 bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-2">AI Recommendations</h2>
          <p className="text-sm text-gray-400 mb-6">Personalized crop rotation strategies.</p>

          {loading && !result && (
            <div className="flex flex-col items-center justify-center py-16">
              <RefreshCw size={40} className="animate-spin text-green-600 mb-4" />
              <p className="text-gray-500">Analyzing your farm details...</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-[#e4eed4] border border-green-200">
                <p className="text-sm font-medium text-green-800">Summary</p>
                <p className="mt-1 text-gray-700">{result.summary}</p>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-4">Recommended crops</h3>
                <div className="space-y-4">
                  {result.recommendations?.map((r, i) => (
                    <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all group">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                            <Sprout size={16} />
                          </div>
                          <h4 className="font-bold text-gray-800 capitalize">{r.crop}</h4>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded">Recommended</span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">{r.reason}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                        <div className="flex gap-2 p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100">
                          <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-tight">Benefits</p>
                            <p className="text-xs text-emerald-700 leading-relaxed">{r.benefits}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 p-2.5 rounded-lg bg-amber-50/50 border border-amber-100">
                          <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[11px] font-bold text-amber-800 uppercase tracking-tight">Precautions</p>
                            <p className="text-xs text-amber-700 leading-relaxed">{r.precautions}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {result.avoid?.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Crops to avoid</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.avoid.map((a, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-red-50/30 border border-red-100/50">
                        <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-red-900 capitalize leading-none mb-1">{a.crop}</p>
                          <p className="text-[10px] text-red-700 leading-tight">{a.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.lastCropsDetected?.length > 0 && (
                <p className="text-xs text-gray-400">
                  Detected history: {result.lastCropsDetected.map((c) => c).join(', ')}
                </p>
              )}
            </div>
          )}

          {!loading && !result && (
            <div className="flex flex-col items-center justify-center py-20">
              <Sprout size={64} className="text-[#4a613a] opacity-60 mb-6" strokeWidth={1.5} />
              <p className="text-gray-500 max-w-xs">Fill out your farm details to receive expert advice.</p>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default RotationAdvice;
