const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4200;
const DIST_FOLDER = path.join(__dirname, 'browser');

// ✅ Cabeceras críticas de seguridad y para Google Sign-In
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

// Servir archivos estáticos
app.use(express.static(DIST_FOLDER));

// Redirigir todo a index.html (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_FOLDER, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Frontend server running on port ${PORT}`);
});
