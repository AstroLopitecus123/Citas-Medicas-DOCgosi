const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4200;
const DIST_FOLDER = path.join(__dirname, 'browser');

// ✅ Cabeceras críticas para que Google Sign-In funcione
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
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
