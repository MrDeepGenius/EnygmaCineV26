# 🚀 Deploy ENYGMA a Render - Guía Completa

## ¿Qué es Render?

Render es un servicio en la nube **gratis** donde puedes alojar tu app (frontend + API server) para que sea accesible desde internet.

**Ventajas:**
- ✅ Gratis para proyectos pequeños
- ✅ Dominio automático (https://enygma-api.render.com)
- ✅ Deployment automático desde Git
- ✅ SSL incluido

---

## 📋 Requisitos Previos

1. ✅ Cuenta en GitHub (https://github.com/signup)
2. ✅ Código listo localmente (lo tienes)
3. ✅ APK generado (opcional, ya lo harás después)

---

## PARTE 1: Preparar Repositorio en GitHub

### Paso 1: Crear cuenta GitHub (si no la tienes)

1. Ve a https://github.com/signup
2. Completa el registro
3. Verifica tu email

### Paso 2: Crear repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre: `enygma-streaming` (o el que prefieras)
3. Descripción: `App de streaming ENYGMA`
4. Selecciona **Private** (privado, solo tu acceso)
5. Click "Create repository"

### Paso 3: Subir código a GitHub

En PowerShell, navega a la carpeta raíz del proyecto:

```powershell
cd "c:\Users\gabii\Desktop\EnygmaV4\enygma-appzip (1)\enygma-appzip"

# Inicializar Git
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Initial commit - ENYGMA streaming app"

# Agregar remoto (reemplaza USERNAME y REPO)
git remote add origin https://github.com/TU_USERNAME/enygma-streaming.git

# Cambiar rama a main
git branch -M main

# Subir código
git push -u origin main
```

**Si pide credenciales:**
- Usuario: Tu email de GitHub
- Contraseña: Tu token personal (https://github.com/settings/tokens)

✅ Tu código está en GitHub

---

## PARTE 2: Deploy API Server a Render

### Paso 1: Conectar Render a GitHub

1. Ve a https://render.com (crea cuenta si no la tienes)
2. Click **"New" → "Web Service"**
3. Selecciona **"Deploy an existing Git repository"**
4. Conecta tu cuenta GitHub
5. Selecciona el repositorio `enygma-streaming`

### Paso 2: Configurar el Servicio

**En la pantalla de Render:**

1. **Name:** `enygma-api`
2. **Region:** `Frankfurt` (o cercano a ti)
3. **Branch:** `main`
4. **Root Directory:** `artifacts/api-server`
5. **Runtime:** `Node`
6. **Build Command:** `pnpm install && pnpm build`
7. **Start Command:** `node dist/index.mjs`
8. **Plan:** Free

### Paso 3: Variables de Entorno

En **Environment Variables** agrega:

```
TMDB_API_KEY = b9b334be32f57187296a06cfed4f2821
NODE_ENV = production
```

**Click "Create Web Service"**

⏳ Render va a compilar tu API (5-10 minutos)

✅ Tu API estará en: `https://enygma-api.render.com`

---

## PARTE 3: Deploy Frontend a Render

### Paso 1: Crear nuevo Static Site

1. En Render dashboard, click **"New" → "Static Site"**
2. Selecciona el repositorio `enygma-streaming`

### Paso 2: Configurar Frontend

1. **Name:** `enygma-web`
2. **Region:** Same as API (Frankfurt)
3. **Branch:** `main`
4. **Root Directory:** `artifacts/enygma`
5. **Build Command:** `PORT=0 BASE_PATH=/ pnpm install && pnpm build`
6. **Publish Directory:** `dist/public`

**Click "Create Static Site"**

⏳ Render va a compilar (5-10 minutos)

✅ Tu frontend estará en: `https://enygma-web.render.com`

---

## PARTE 4: Conectar Frontend con API

### Paso 1: Actualizar configuración del frontend

En el archivo:
```
artifacts/enygma/src/lib/api-client.ts
```

Cambia la URL base:

```typescript
// Antes
const BASE = "http://localhost:8000"

// Después
const BASE = "https://enygma-api.render.com"
```

### Paso 2: Hacer commit y push

```powershell
git add .
git commit -m "Update API URL to Render"
git push origin main
```

Render **automáticamente** va a recompilar tu frontend con la nueva URL.

✅ Ahora frontend y API están conectados

---

## PARTE 5: Actualizar APK para usar Render

Edita el archivo:
```
artifacts/enygma/capacitor.config.json
```

Cambia:
```json
{
  "server": {
    "url": "https://enygma-web.render.com"
  }
}
```

Luego recompila el APK:
```powershell
cd artifacts/enygma/android
.\gradlew assembleDebug
```

---

## ✅ Checklist de Deployment

- [ ] Cuenta GitHub creada
- [ ] Repositorio creado en GitHub
- [ ] Código subido a GitHub
- [ ] Cuenta Render creada
- [ ] API Server en Render (https://enygma-api.render.com)
- [ ] Frontend en Render (https://enygma-web.render.com)
- [ ] Frontend conectado con API
- [ ] APK actualizado con URLs de Render
- [ ] APK generado y testeado

---

## 🧪 Testing

### Test 1: Frontend en navegador

```
https://enygma-web.render.com
```

Debería cargar la app. Intenta:
- Ver películas
- Hacer búsqueda
- Abrir admin

### Test 2: API desde navegador

```
https://enygma-api.render.com/api/content/movies?limit=5
```

Debería devolver JSON con películas

### Test 3: APK en teléfono

1. Instala el APK
2. Abre ENYGMA
3. Intenta reproducir una película
4. Verifica que se conecta a Render

---

## 🔗 URLs Finales

Una vez deployado, tendrás:

| Servicio | URL |
|----------|-----|
| **Frontend** | https://enygma-web.render.com |
| **API** | https://enygma-api.render.com |
| **APK** | Tu archivo local (app-debug.apk) |

---

## 💡 Próximos Pasos (Opcionales)

### 1. Agregar dominio personalizado

En Render dashboard:
- Settings → Custom Domain
- Agregar `enygma.tudominio.com`

### 2. Generar APK Release para Google Play

```powershell
cd artifacts/enygma/android
.\gradlew assembleRelease
```

Luego registrarse en Google Play Console ($25 USD)

### 3. Configurar CI/CD automático

Ya está hecho! Render automáticamente redeploya cuando haces push a GitHub

---

## 🆘 Troubleshooting

### Frontend carga pero página en blanco

```
Solución: Verifica que la URL de API sea correcta en capacitor.config.json
```

### API no responde

```
Solución: Revisa logs en Render dashboard
Settings → Logs
```

### APK no se conecta

```
Solución: Verifica que capacitor.config.json tiene URL correcta de Render
Recompila APK
```

### Build falló en Render

```
Solución: Revisa los logs en Render
Probablemente falta alguna variable de entorno
```

---

## 📞 Soporte

Si algo no funciona, revisa:

1. **Logs de Render** (dashboard → Logs)
2. **Console del navegador** (F12 en frontend)
3. **Consola de errores** del APK (adb logcat)

---

## 🎉 ¡Listo!

Una vez completado, tu app estará:
- ✅ Online en Render
- ✅ Accesible desde cualquier lugar
- ✅ Con APK distribuible
- ✅ Production-ready

**¡Felicidades!** 🚀
