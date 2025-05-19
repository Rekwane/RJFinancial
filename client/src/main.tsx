import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add Font Awesome for icons
const fontAwesomeScript = document.createElement('script');
fontAwesomeScript.src = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js";
fontAwesomeScript.crossOrigin = "anonymous";
document.head.appendChild(fontAwesomeScript);

// Add Inter and Roboto fonts
const fontLink = document.createElement('link');
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap";
document.head.appendChild(fontLink);

// Update the document title
document.title = "FinancialAI - Credit Repair & Financial Management";

// Add meta description for SEO
const metaDescription = document.createElement('meta');
metaDescription.name = "description";
metaDescription.content = "Comprehensive financial application for credit repair using UCC code, trust document creation, and automated EIN acquisition.";
document.head.appendChild(metaDescription);

createRoot(document.getElementById("root")!).render(<App />);
