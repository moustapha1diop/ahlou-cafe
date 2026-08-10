const cloudinary = require('cloudinary').v2;

// La variable d'environnement CLOUDINARY_URL (format cloudinary://key:secret@cloudname)
// est automatiquement lue par le SDK Cloudinary, aucune config manuelle n'est nécessaire
// tant qu'elle est bien définie dans les variables d'environnement (Render > Environment).
if (!process.env.CLOUDINARY_URL) {
  console.warn(
    "⚠️  CLOUDINARY_URL manquant. Les images/vidéos uploadées ne seront pas stockées de façon permanente."
  );
}

module.exports = cloudinary;
