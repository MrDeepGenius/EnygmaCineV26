# Generar APK de ENYGMA con Capacitor

Tu app está lista para empacar como APK. Aquí están los pasos para generarlo:

## Requisitos

### Windows
1. **Java Development Kit (JDK) 17+**
   - Descargar desde: https://www.oracle.com/java/technologies/downloads/
   - Instalar y recordar la ruta de instalación

2. **Android SDK**
   - Descargar Android Studio: https://developer.android.com/studio
   - O instalar solo Android SDK Command-line Tools

3. **Gradle** (viene con Android Studio)

### macOS
```bash
# Con Homebrew
brew install openjdk@17
brew install --cask android-studio
```

### Linux
```bash
sudo apt-get install openjdk-17-jdk
sudo apt-get install android-studio
```

## Pasos para Generar el APK

### 1. Configurar Variables de Entorno

**Windows (PowerShell):**
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17.0.x"  # Ajusta la versión
$env:ANDROID_HOME = "C:\Users\TuUsuario\AppData\Local\Android\Sdk"
```

**Windows (CMD):**
```cmd
set JAVA_HOME=C:\Program Files\Java\jdk-17.0.x
set ANDROID_HOME=C:\Users\TuUsuario\AppData\Local\Android\Sdk
```

**macOS/Linux:**
```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export ANDROID_HOME=~/Android/Sdk
```

### 2. Validar Configuración

```bash
cd artifacts/enygma/android
./gradlew --version  # En Windows: .\gradlew --version
```

Deberías ver la versión de Gradle.

### 3. Generar APK Debug

```bash
cd artifacts/enygma/android
./gradlew assembleDebug  # En Windows: .\gradlew assembleDebug
```

**Tiempo estimado:** 5-15 minutos (depende de tu PC)

**Output esperado:**
```
BUILD SUCCESSFUL in Xs
:app:assembleDebug
```

El APK estará en:
```
app/build/outputs/apk/debug/app-debug.apk
```

### 4. Generar APK Release (Firmado - para Google Play)

```bash
./gradlew assembleRelease
```

Esto requiere un keystore. Primero genera uno:

```bash
keytool -genkey -v -keystore app.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias app-key
```

Luego copia `app.keystore` a `android/` y configura en `android/app/build.gradle`.

## Instalar APK en Dispositivo

### Opción 1: Conectar por USB

```bash
# Habilitar USB Debug en tu teléfono
# Conectar teléfono por USB
.\gradlew installDebug  # Windows
./gradlew installDebug  # macOS/Linux
```

### Opción 2: Transferir el APK

1. Copiar `app-debug.apk` a tu teléfono
2. Aceptar instalación desde fuentes desconocidas
3. Instalar manualmente

### Opción 3: Usar Android Studio

1. Abrir `android` en Android Studio
2. Conectar dispositivo
3. Click en "Run" → Seleccionar dispositivo
4. Android Studio instalará automáticamente

## Troubleshooting

### "JAVA_HOME not found"
```bash
# Verificar Java instalado
java -version

# Encontrar Java home
which java  # macOS/Linux
where java  # Windows
```

### "Android SDK not found"
1. Abrir Android Studio
2. Settings → SDK Manager
3. Instalar API 33 (Tiramisu) o superior
4. Notar la ruta del SDK

### "Gradle sync failed"
```bash
# Limpiar y reintentar
./gradlew clean
./gradlew assembleDebug
```

### "Certificate expired"
El certificado de HTTPS tiene validez. No afecta si usas HTTP en Android.

## Configuración de API

Por defecto, la app se conecta a:
- **API Server:** `http://localhost:8000`

Para cambiar en producción, editar:
```
artifacts/enygma/src/lib/api-client.ts
```

O usar variables de entorno en el `.env`.

## Tamaño del APK

- **Debug APK:** ~50-80 MB
- **Release APK:** ~30-50 MB (con minificación)

## Características en el APK

✅ All features del sitio web
✅ Responsive diseño móvil
✅ Streaming de video (con API configurada)
✅ Admin panel completo
✅ Analytics en tiempo real
✅ Top 10 con logos de TMDB
✅ Carátulas agrandadas (HBO Max style)

## Siguientes Pasos

1. **Configurar API Server:**
   - API debe estar accesible desde Android
   - En `capacitor.config.json`, cambiar:
   ```json
   "server": {
     "url": "https://tu-api-servidor.com",  // Tu URL de producción
   }
   ```

2. **Firmar para Google Play:**
   - Generar keystore con validez de 10+ años
   - Registrarse como desarrollador en Google Play Console ($25)
   - Subir APK release

3. **Build Production:**
   ```bash
   ./gradlew build
   ```

## Documentación Oficial

- Capacitor: https://capacitorjs.com/docs/getting-started
- Android Development: https://developer.android.com/docs
- Gradle Build: https://gradle.org/

---

¿Necesitas ayuda con algún paso? Contáctame.
