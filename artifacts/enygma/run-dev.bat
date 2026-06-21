@echo off
cd /d "%~dp0"
node "..\..\node_modules\.pnpm\vite@7.3.5_@types+node@25.9_516434daca57827e6151b97fb5fabc13\node_modules\vite\bin\vite.js" --config vite.config.ts --host 0.0.0.0
