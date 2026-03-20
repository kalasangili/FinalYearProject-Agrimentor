import React, { useRef, useEffect, useState } from 'react';
import DashboardLayout from "../layouts/DashboardLayout";
import { ScanLine, Bug, CameraOff } from "lucide-react";

const ARScanner = () => {
  const videoRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  // Initialize Camera on Mount
  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setHasPermission(false);
      }
    }
    setupCamera();

    // Cleanup: Stop camera when leaving the page
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const handleScan = () => {
    setIsScanning(true);
    // Simulate AI Analysis delay
    setTimeout(() => {
      setIsScanning(false);
      alert("Pest analysis complete: No major threats detected.");
    }, 2000);
  };

  return (
    <DashboardLayout>
      {/* Header Matches the Dashboard/Weather style */}
      <header className="bg-white py-4 px-8 border-b border-gray-200">
        <h1 className="text-2xl font-serif font-bold text-gray-800 tracking-tight">
          AR Pest Scanner
        </h1>
      </header>

      <div className="p-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Live Camera Feed */}
        <section className="flex-1 bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">Live Camera Feed</h2>
            <p className="text-sm text-gray-400 mt-1">Point your camera at a plant leaf to scan for pests.</p>
          </div>

          <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-gray-100 shadow-inner">
            {hasPermission === false ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-gray-50 p-6 text-center">
                <CameraOff size={48} className="mb-4 opacity-20" />
                <p>Camera access denied. Please enable camera permissions in your browser.</p>
              </div>
            ) : (
              <>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
                {/* Visual Scanning Overlay */}
                {isScanning && (
                  <div className="absolute inset-0 border-t-2 border-green-400 animate-scan pointer-events-none shadow-[inset_0_0_40px_rgba(74,222,128,0.2)]" />
                )}
              </>
            )}
          </div>

          <button
            onClick={handleScan}
            disabled={!hasPermission || isScanning}
            className={`w-full mt-8 bg-[#5b7548] hover:bg-[#4a613a] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md ${
              isScanning ? 'opacity-70 cursor-wait' : ''
            }`}
          >
            <ScanLine size={18} className={isScanning ? 'animate-pulse' : ''} />
            {isScanning ? 'Analyzing Feed...' : 'Scan for Pests'}
          </button>
        </section>

        {/* Right Column: Analysis Results */}
        <section className="flex-1 bg-white rounded-xl border border-gray-200 p-8 shadow-sm flex flex-col h-full">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800">Analysis Results</h2>
            <p className="text-sm text-gray-400 mt-1">The AI's pest identification will appear here.</p>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-[#f6f9ef] rounded-full flex items-center justify-center mb-6">
              <Bug size={40} className="text-[#5b7548] opacity-60" strokeWidth={1.5} />
            </div>
            <p className="text-gray-500 max-w-[240px] leading-relaxed">
              Pest analysis results will be shown here.
            </p>
          </div>
        </section>

      </div>

      {/* Custom Styling for the scanning line animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan {
          position: absolute;
          width: 100%;
          height: 2px;
          animation: scan 2s linear infinite;
        }
      `}} />
    </DashboardLayout>
  );
};

export default ARScanner;