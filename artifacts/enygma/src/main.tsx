import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl } from "./api-client";

// Set the API base URL - use window.location.origin to dynamically get the current host
const apiBaseUrl = `${window.location.protocol}//${window.location.hostname}:8000`;
setBaseUrl(apiBaseUrl);

createRoot(document.getElementById("root")!).render(<App />);
