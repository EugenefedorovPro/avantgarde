// import reactLogo from './assets/react.svg'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Verse } from "./pages/Verse";
import { RandVersePage } from "./pages/RandVerse";
import "./ui.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/verse" replace />} />
        <Route path="/verse" element={<Verse />} />
        <Route path="/rand_verse" element={<RandVersePage />} />
        <Route path="*" element={<div>404</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
