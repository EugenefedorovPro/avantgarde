import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Verse } from "./pages/Verse";
import { RandVersePage } from "./pages/RandVerse";
import { ReclamationPage } from "./pages/Reclamation";
import { ManageContentOrder } from "./api/manageContentOrder";
import { defaultVerseUrl } from "./api/urls";
import { Neologizm } from "./pages/Neologizm";
import { Download } from "./pages/Download";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/manage" element={<ManageContentOrder />} />

        {/* / -> random verse */}
        <Route path="/" element={<Navigate to="/Neologizm" replace />} />

        {/* optional: keep /verse redirect to default */}
        <Route
          path="/verse"
          element={<Navigate to={defaultVerseUrl} replace />}
        />

        {/* real verse */}
        <Route path="/verse/:html_name" element={<Verse />} />

        <Route path="/rand_verse" element={<RandVersePage />} />
        <Route path="/reclamation" element={<ReclamationPage />} />
        <Route path="/reclamation/:html_name" element={<ReclamationPage />} />

        <Route path="/neologizm" element={<Neologizm />} />
        <Route path="/print_copy" element={<Download />} />

        <Route path="*" element={<div>404</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
