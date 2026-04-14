import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import LearningModules from "./pages/LearningModules";
import Weather from "./pages/Weather";
import DiseaseDetection from "./pages/DeseaseDetection";
// import MarketPrice from "./pages/MarketPrice";
import MarketPrices from "./pages/MarketPrice";
import RotationAdvice from "./pages/RotationAdvice";
import ARScanner from "./pages/ARScanner";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/disease" element={<DiseaseDetection />} />
        <Route path="/market" element={<MarketPrices />} />
        <Route path="/rotation" element={<RotationAdvice/>}/>
        <Route path="/ar-scanner" element={<ARScanner/>}/>
        <Route path="/learning" element={<LearningModules />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;