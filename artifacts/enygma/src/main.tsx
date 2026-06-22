import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl } from "./api-client";

// Set the API base URL - detect if we're in production or development
let apiBaseUrl: string;

if (process.env.NODE_ENV === "production") {
  // In production on Render, use the API service URL
  apiBaseUrl = "https://enygma-api-gyfe.onrender.com";
} else {
  // In development, use localhost:8000
  apiBaseUrl = `${window.location.protocol}//${window.location.hostname}:8000`;
}

setBaseUrl(apiBaseUrl);

createRoot(document.getElementById("root")!).render(<App />);
