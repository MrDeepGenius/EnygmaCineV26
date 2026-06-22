// Vercel Serverless Function - Proxy al API de Express
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiServerPath = path.join(__dirname, '../artifacts/api-server');

let serverProcess = null;

// Iniciar el servidor Express si no está corriendo
function startServer() {
  if (serverProcess) return;
  
  serverProcess = spawn('node', ['dist/index.mjs'], {
    cwd: apiServerPath,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: 8000,
    }
  });
}

export default function handler(req, res) {
  startServer();
  
  // Proxy simple: redirigir al servidor Express local
  // En producción de Vercel, esto no funcionará directamente
  // Mejor usar un enfoque diferente
  
  res.status(200).json({ message: 'API Server está en construcción' });
}
