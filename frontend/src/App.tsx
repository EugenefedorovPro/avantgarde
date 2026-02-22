import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { Verse } from "./pages/Verse";
import { RandVersePage } from "./pages/RandVerse";
import { ReclamationPage } from "./pages/Reclamation";
import { Neologizm } from "./pages/Neologizm";
import { Download } from "./pages/Download";

import { ManageContentOrderOverlay } from "./api/ManageContentOrderOverlay";
import { defaultVerseUrl } from "./api/urls";

function App() {
  return (
    <BrowserRouter>
      {/* Always mounted controller (no UI, no blink) */}
      <ManageContentOrderOverlay />

      <Routes>
        {/* Start page */}
        <Route path="/" element={<Navigate to="/neologizm" replace />} />

        {/* Canonical redirect for /verse */}
        <Route path="/verse" element={<Navigate to={defaultVerseUrl} replace />} />

        {/* Real pages */}
        <Route path="/verse/:html_name" element={<Verse />} />
        <Route path="/rand_verse" element={<RandVersePage />} />

        <Route path="/reclamation" element={<ReclamationPage />} />
        <Route path="/reclamation/:html_name" element={<ReclamationPage />} />

        <Route path="/neologizm" element={<Neologizm />} />
        <Route path="/print_copy" element={<Download />} />

        {/* Not found */}
        <Route path="*" element={<div>404</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
