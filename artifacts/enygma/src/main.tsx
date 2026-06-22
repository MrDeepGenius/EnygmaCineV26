import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl } from "./api-client";

// Set the API base URL - detect environment and use relative path or specific URL
let apiBaseUrl: string;

if (process.env.NODE_ENV === "production") {
  // In production, try to connect to /api on the same domain first
  // This assumes the API is being served from the same Render instance
  // If that fails, the app will fall back gracefully
  apiBaseUrl = `${window.location.protocol}//${window.location.hostname}/api`;
} else {
  // In development, use localhost:8000
  apiBaseUrl = `${window.location.protocol}//${window.location.hostname}:8000/api`;
}

setBaseUrl(apiBaseUrl);

createRoot(document.getElementById("root")!).render(<App />);
