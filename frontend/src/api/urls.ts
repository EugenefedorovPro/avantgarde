export const baseUrl = import.meta.env.VITE_BASE_URL as string;

// API endpoints
export const urlVerse = `${baseUrl}/api/verse/`;
export const urlRandVerse = `${baseUrl}/api/rand_verse/`;
export const urlHerm = `${baseUrl}/api/herm/`;
export const urlReclamation = `${baseUrl}/api/reclamation/`;
export const urlContentOrder = `${baseUrl}/api/content_order/`;
export const urlNeologizm = `${baseUrl}/api/neologizm/`;

export const urlPdfFile = `${baseUrl}/api/print/pdf/`;
export const urlPdfText = `${baseUrl}/api/print/text/`;

// ✅ FRONTEND route (not API URL)
export const defaultVerseUrl = "/verse/avantgarde_at_war";
