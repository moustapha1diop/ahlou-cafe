const mongoose = require('mongoose');

async function connectDB() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI manquant. Copiez server/.env.example en server/.env et renseignez votre lien MongoDB Atlas."
      );
    }

    // Si la connexion tombe, on ne veut JAMAIS que les requêtes restent bloquées
    // indéfiniment en attendant une reconnexion. On préfère une erreur claire et rapide.
    mongoose.set('bufferCommands', false);

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000, // abandonne après 8s si Atlas ne répond pas
      socketTimeoutMS: 20000,
    });

    console.log('✅ Connecté à MongoDB Atlas');

    mongoose.connection.on('disconnected', () => {
      console.error('⚠️  MongoDB Atlas déconnecté. Le serveur va tenter de se reconnecter automatiquement.');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB Atlas reconnecté.');
    });
  } catch (err) {
    console.error('❌ Erreur de connexion à MongoDB Atlas :', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
