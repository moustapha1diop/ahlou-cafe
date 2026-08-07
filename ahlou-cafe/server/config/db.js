const mongoose = require('mongoose');

async function connectDB() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI manquant. Copiez server/.env.example en server/.env et renseignez votre lien MongoDB Atlas."
      );
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB Atlas');
  } catch (err) {
    console.error('❌ Erreur de connexion à MongoDB Atlas :', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
