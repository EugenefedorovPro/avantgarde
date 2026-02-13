import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Verse } from "./pages/Verse";
import { RandVersePage } from "./pages/RandVerse";
import { ReclamationPage } from "./pages/Reclamation";
import { ManageContentOrder } from "./api/manageContentOrder";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/manage" element={<ManageContentOrder />} />
        <Route path="/" element={<Navigate to="/verse" replace />} />
        <Route path="/verse" element={<Verse />} />
        <Route path="/rand_verse" element={<RandVersePage />} />
        <Route path="/reclamation" element={<ReclamationPage />} />
        <Route path="/reclamation/:html_name" element={<ReclamationPage />} />
        <Route path="*" element={<div>404</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
