require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// Sert le site (public/) et les fichiers uploadés (uploads/)
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/media', require('./routes/media'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur Ahlou Café démarré sur http://localhost:${PORT}`);
  console.log(`   Site public : http://localhost:${PORT}`);
  console.log(`   Dashboard   : http://localhost:${PORT}/admin.html`);
});
