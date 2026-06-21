# 🚀 Quick Start - Generar APK en 5 Minutos

## El Resumen

Tu app web está **lista y compilada**. Ahora solo necesitas:
1. Instalar Java
2. Correr un comando
3. ¡APK listo!

## Pre-requisitos (Instalación 1x)

### Windows

1. **Descargar Java 17**
   - https://www.oracle.com/java/technologies/downloads/
   - Instalar (la ruta típica es `C:\Program Files\Java\jdk-17.x.x`)

2. **Descargar Android Studio**
   - https://developer.android.com/studio
   - Instalar (se instala Android SDK automáticamente)

3. **Agregar a PATH**
   - Abrir PowerShell como Admin
   - Copiar y pegar estas líneas:

```powershell
# Reemplaza con tu ruta de Java
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17.0.x"
$env:ANDROID_HOME = "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk"

# Agregar a PATH permanente (opcional para futuro)
[Environment]::SetEnvironmentVariable("JAVA_HOME", "$env:JAVA_HOME", "User")
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:ANDROID_HOME", "User")
```

4. **Verificar**
   ```powershell
   java -version
   echo $env:ANDROID_HOME
   ```

### macOS

```bash
# Instalar con Homebrew
brew install openjdk@17 android-studio

# Configurar variables
echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 17)' >> ~/.zshrc
echo 'export ANDROID_HOME=~/Library/Android/sdk' >> ~/.zshrc
source ~/.zshrc

# Verificar
java -version
```

### Linux

```bash
# Debian/Ubuntu
sudo apt-get update
sudo apt-get install openjdk-17-jdk android-studio

# Configurar variables
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk' >> ~/.bashrc
echo 'export ANDROID_HOME=~/Android/Sdk' >> ~/.bashrc
source ~/.bashrc

# Verificar
java -version
```

## Generar APK (El Comando)

```bash
# Navegar a la carpeta
cd artifacts/enygma/android

# Compilar
./gradlew assembleDebug

# En Windows PowerShell
.\gradlew assembleDebug
```

**Duración:** 5-15 minutos (primera vez descarga dependencias)

## ¿Dónde está el APK?

```
artifacts/enygma/android/app/build/outputs/apk/debug/app-debug.apk
```

**Tamaño:** ~60 MB

## Instalar en Teléfono

### Opción 1: Por USB (Lo más Rápido)

```bash
# Conectar teléfono con cable USB
# Habilitar "USB Debug" en Settings > Developer Options

./gradlew installDebug
```

✨ ¡App se instala automáticamente en tu teléfono!

### Opción 2: Transferir Archivo

1. Copiar `app-debug.apk` a tu teléfono
2. Tocar archivo → Instalar
3. Aceptar permisos

### Opción 3: Android Studio

1. Abrir Android Studio
2. File → Open → `artifacts/enygma/android`
3. Conectar teléfono
4. Click "Run" (botón verde ▶)

## Primeros Pasos en la App

1. **Abre ENYGMA** en tu teléfono
2. **Inicio:** Verás hero banner con logos TMDB
3. **Navega:** Swipe izquierda/derecha en hero
4. **Películas:** Scroll para ver todas las secciones
5. **Admin:** En settings (esquina superior) → Admin panel

## Problemas Comunes

### "gradle not found"
- Windows: Verifica que estés en `artifacts/enygma/android`
- Intenta: `.\gradlew.bat assembleDebug` (en Windows)

### "JAVA_HOME not set"
```bash
# Verificar que Java está instalado
java -version

# Si no aparece nada, instalar Java nuevamente
```

### "Android SDK not found"
- Abre Android Studio
- Acepta todo (SDK Manager se instala automáticamente)
- Espera a que descargue (5-10 min)

### "Build takes too long"
- Normal en primera compilación (descarga Gradle)
- Próximas compilaciones son 10x más rápidas

### "APK no se instala"
- Verificar: Settings > Developer Options > Unknown Sources (ON)
- O usar Android Studio para instalar

## Generar Release APK (Para Google Play)

Cuando quieras publicar:

```bash
# Generar certificado (1x)
keytool -genkey -v -keystore app.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias enygma

# Mover certificado a android/
mv app.keystore android/

# Compilar Release
./gradlew assembleRelease

# APK estará en:
# android/app/build/outputs/apk/release/app-release.apk
```

## Configuración de API

La app intenta conectar a `http://localhost:8000` por defecto.

**Para producción**, editar `artifacts/enygma/capacitor.config.json`:

```json
{
  "server": {
    "url": "https://tu-api.com"
  }
}
```

Luego recompilar.

## Próximos Pasos

✅ APK generado
✅ Testeado en teléfono
✅ ¿Ahora qué?

1. **Publicar en Google Play** (~$25 USD, 1x)
   - Crear cuenta en Google Play Console
   - Subir APK/AAB release
   - Hacer público

2. **Usar en iOS** (Requiere Mac)
   - Usar Xcode
   - Generar IPA

3. **Compartir Beta** (Gratis)
   - Enviar `app-debug.apk` por email
   - Amigos lo instalan directamente

## Información Útil

- **App ID:** `com.enygma.app`
- **Version:** 1.0.0
- **Min API:** 24 (Android 7.0+)
- **Target API:** 33 (Android 13+)

## Documentación Completa

- `BUILD_APK.md` - Guía detallada
- `APK_READY.md` - Resumen técnico
- Capacitor Docs: https://capacitorjs.com

---

¿Necesitas que:
- [ ] Genere el APK automáticamente (requiere CI/CD)
- [ ] Configure Google Play
- [ ] Agregue más funciones antes de compilar
- [ ] Cambio la configuración de API

Solo pídeme. ¡Tu app está lista para el mundo! 🌍📱
