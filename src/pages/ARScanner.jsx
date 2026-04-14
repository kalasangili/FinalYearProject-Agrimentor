import React, { useRef, useState, useCallback, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Camera, CameraOff, RefreshCw, AlertCircle, ShieldCheck, Zap, Info, Bug } from 'lucide-react';
import { scanPest } from '../services/api';

const ARScanner = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [autoScan, setAutoScan] = useState(false);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use back camera on mobile
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error('Camera Access Error:', err);
      setError('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setAutoScan(false);
  }, [stream]);

  const captureFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || scanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Match canvas to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current frame
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to Blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8);
    });
  }, [scanning]);

  const performScan = useCallback(async () => {
    const blob = await captureFrame();
    if (!blob) return;

    setScanning(true);
    try {
      const data = await scanPest(blob);
      setResult(data);
      
      // Auto-hide results after 10 seconds if in auto-scan mode
      if (autoScan) {
        setTimeout(() => setResult(prev => prev === data ? null : prev), 10000);
      }
    } catch (err) {
      console.error('Scan Error:', err);
      // Don't show full error UI in auto-scan to avoid flickering
      if (!autoScan) setError(err.message || 'Scan failed');
    } finally {
      setScanning(false);
    }
  }, [captureFrame, autoScan]);

  // Auto-scan logic: Scan every 5 seconds
  useEffect(() => {
    let interval;
    if (autoScan && stream) {
      interval = setInterval(() => {
        if (!scanning) performScan();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [autoScan, stream, scanning, performScan]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#FDFDE6] p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-green-900 flex items-center gap-3">
                <Bug className="text-green-700" /> AR Pest Scanner
              </h1>
              <p className="text-green-700 mt-2">Real-time AI detection through your camera feed.</p>
            </div>
            
            <div className="flex gap-3">
              {!stream ? (
                <button 
                  onClick={startCamera}
                  className="px-6 py-3 bg-green-700 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-green-800 transition-all shadow-lg shadow-green-100"
                >
                  <Camera size={20} /> Open Camera
                </button>
              ) : (
                <button 
                  onClick={stopCamera}
                  className="px-6 py-3 bg-red-100 text-red-700 rounded-xl font-bold flex items-center gap-2 hover:bg-red-200 transition-all"
                >
                  <CameraOff size={20} /> Stop Camera
                </button>
              )}
            </div>
          </header>

          <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Viewfinder Area */}
            <div className="lg:col-span-2 relative aspect-[4/3] bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover"
              />
              
              {/* Invisible canvas for capturing */}
              <canvas ref={canvasRef} className="hidden" />

              {!stream && !error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40">
                  <Camera size={64} className="mb-4 animate-pulse" />
                  <p className="font-medium">Camera is offline</p>
                </div>
              )}

              {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50/90 text-red-700 p-8 text-center">
                  <AlertCircle size={48} className="mb-4" />
                  <p className="font-bold text-xl mb-2">Camera Error</p>
                  <p className="max-w-xs text-sm opacity-80 mb-6">{error}</p>
                  <button onClick={startCamera} className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold">
                    Try Again
                  </button>
                </div>
              )}

              {/* AR HUD Overlay */}
              {stream && (
                <div className="absolute inset-0 pointer-events-none border-[16px] border-white/10 flex flex-col items-center justify-center">
                  {/* Scanning Reticle */}
                  <div className={`w-64 h-64 border-2 rounded-3xl transition-all duration-700 flex items-center justify-center ${
                    scanning ? 'border-green-400 scale-110' : 'border-white/30'
                  }`}>
                    <div className={`w-full h-1 bg-green-400/50 absolute transition-all duration-1000 ${
                      scanning ? 'top-full opacity-0' : 'top-0 opacity-100 animate-[scan-line_2s_infinite]'
                    }`} />
                  </div>

                  {/* Top Status Bar */}
                  <div className="absolute top-8 left-8 right-8 flex justify-between items-center">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-bold text-white uppercase tracking-wider">
                      <div className={`w-2 h-2 rounded-full ${scanning ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                      {scanning ? 'Analyzing Frame...' : 'AI Vision Active'}
                    </div>
                    
                    <button 
                      onClick={() => setAutoScan(!autoScan)}
                      className={`pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-[10px] font-bold uppercase tracking-wider ${
                        autoScan ? 'bg-green-500 border-green-400 text-white' : 'bg-black/40 border-white/20 text-white'
                      }`}
                    >
                      <Zap size={14} className={autoScan ? 'fill-white' : ''} />
                      {autoScan ? 'Auto-Scan ON' : 'Auto-Scan OFF'}
                    </button>
                  </div>

                  {/* AR Result Bounding Box UI */}
                  {result && (
                    <div className="absolute inset-0 flex items-center justify-center p-8 animate-in zoom-in duration-300">
                      <div className="bg-white/90 backdrop-blur-xl p-5 rounded-2xl shadow-2xl border-2 border-green-500 max-w-sm pointer-events-auto">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <ShieldCheck size={24} className="text-green-700" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 leading-none">{result.label}</h3>
                              <p className="text-[10px] font-bold text-green-600 mt-1 uppercase tracking-tighter">
                                {Math.round(result.confidence * 100)}% Match
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            result.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                            result.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {result.severity}
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          <p className="text-xs text-gray-600 leading-relaxed italic border-l-2 border-gray-200 pl-3">
                            {result.description}
                          </p>
                          <div className="p-3 bg-green-800 rounded-xl text-white">
                            <h4 className="text-[10px] font-bold uppercase opacity-60 mb-1">Recommended Action</h4>
                            <p className="text-xs font-medium">{result.treatment}</p>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => setResult(null)}
                          className="w-full mt-4 py-2 text-[10px] font-bold text-gray-400 uppercase hover:text-gray-600 transition-colors"
                        >
                          Dismiss Result
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar Instructions / Logs */}
            <div className="space-y-6">
              <section className="bg-white p-6 rounded-3xl border border-green-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Info size={18} className="text-green-600" />
                  How to Scan
                </h2>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center shrink-0">1</div>
                    <p className="text-sm text-gray-600">Position the leaf within the white reticle.</p>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center shrink-0">2</div>
                    <p className="text-sm text-gray-600">Ensure the leaf is well-lit and stable.</p>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center shrink-0">3</div>
                    <p className="text-sm text-gray-600">Click <b>Analyze Frame</b> or enable <b>Auto-Scan</b>.</p>
                  </li>
                </ul>
              </section>

              <div className="p-2">
                <button 
                  disabled={!stream || scanning}
                  onClick={performScan}
                  className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${
                    stream && !scanning
                      ? 'bg-green-700 text-white hover:bg-green-800 shadow-xl shadow-green-100'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {scanning ? (
                    <>
                      <RefreshCw size={20} className="animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Zap size={20} />
                      Analyze Frame
                    </>
                  )}
                </button>
              </div>

              {result && (
                <div className="bg-green-50 p-6 rounded-3xl border border-green-100 animate-in slide-in-from-bottom-4">
                  <h3 className="font-bold text-green-900 mb-2">Last Detection</h3>
                  <p className="text-sm text-green-800 font-medium">{result.label}</p>
                  <p className="text-xs text-green-700 mt-1 opacity-80">{result.treatment}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan-line {
          0% { transform: translateY(0); }
          50% { transform: translateY(256px); }
          100% { transform: translateY(0); }
        }
      `}} />
    </DashboardLayout>
  );
};

export default ARScanner;
