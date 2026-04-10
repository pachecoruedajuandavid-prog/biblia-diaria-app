# Guía Oficial: Cómo empaquetar "Lectura Bíblica Diaria" para Google Play Store

Esta aplicación fue construida como una **PWA (Progressive Web App)** de grado Premium.
Para subir esta app a la Google Play Store, no necesitas aprender Java o Android Studio. Utilizaremos el protocolo TWA (Trusted Web Activity) respaldado por **Microsoft (PWABuilder)**.

Sigue estos 5 sencillos pasos:

## Paso 1: Alojar (Hostear) la Aplicación en Internet
PWABuilder requiere que tu aplicación PWA ya esté subida a un servidor público con certificado de seguridad (`https://`).
- Puedes subir la carpeta completa de manera gratuita usando [Netlify Drop](https://app.netlify.com/drop), Github Pages, o Firebase Hosting.
- Copia el Enlace URL seguro que te dé la plataforma (Ej: `https://mi-biblia.netlify.app`).

## Paso 2: Evaluar la aplicación en PWABuilder
1. Entra a [PWABuilder.com](https://www.pwabuilder.com/).
2. Pega el enlace de tu aplicación y presiona **Start**.
3. PWABuilder hará un análisis de tu `manifest.json`, `sw.js` (Service Worker) y el nivel de seguridad.
4. Tu resultado debería ser superior a 100 puntos y mostrar todo en verde, ya que implementamos todos los metadatos necesarios.

## Paso 3: Generar el Archivo Android (.aab / .apk)
1. En la pantalla de resultados de PWABuilder, haz clic en **"Package for Android"**.
2. Rellena los datos de la app:
   - **App Name:** Lectura Bíblica Diaria
   - **Package Name:** `com.tuempresa.bibliadiaria` (elige uno único)
   - **URL de Política de Privacidad:** (Necesitarás subir un texto sencillo online sobre privacidad).
3. Asegúrate de guardar **LAS LLAVES (Keys)** que te dará PWABuilder. ¡Es crucial si luego quieres actualizar la App!
4. Haz clic en **Generate** y descarga el archivo `.zip`. Lo abres y encontrarás un archivo `.aab` (Android App Bundle).

## Paso 4: Subir a Google Play Console
1. Crea una cuenta en [Google Play Console](https://play.google.com/console/) (Cuesta $25 USD pago único).
2. Crea una "Nueva Aplicación" y llena toda la ficha de la tienda (capturas de pantalla, logotipo y categoría "Educación" o "Estilo de vida").
3. Ve a la sección **"Producción"** -> **"Crear nueva versión (Release)"**.
4. ¡Sube el archivo `.aab` que te descargó PWABuilder!

## Paso 5: AssetLinks (Opcional pero Recomendado)
Google requerirá validar que tú eres el dueño de ese sitio web en el que basaste el TWA.
- PWABuilder te instruirá para descargar un archivo llamado `assetlinks.json`.
- Debes poner ese archivo en tu carpeta de proyecto en esta ruta: `.well-known/assetlinks.json` y volver a subir tu página.
- Con esto listo, el navegador Chrome no mostrará ninguna barra de URL en la app y parecerá 100% nativa de Android.

¡Felicidades! En unos pocos días tendrás tu app monatizada, premium y disponible en Google Play.
