const express = require('express');
const multer = require('multer');
const streamifier = require('streamifier');

const cloudinary = require('../config/cloudinary');
const Media = require('../models/Media');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// On garde le fichier uploadé en mémoire (pas sur le disque du serveur, qui est
// effacé à chaque redémarrage sur Render) puis on l'envoie directement vers Cloudinary,
// qui le stocke de façon permanente et nous donne une URL publique stable.
const storage = multer.memoryStorage();

const allowedExtensions = /\.(jpe?g|png|gif|webp|mp4|mov|webm|avi)$/i;

const upload = multer({
  storage,
  limits: { fileSize: 150 * 1024 * 1024 }, // 150 Mo max (utile pour les vidéos)
  fileFilter: (req, file, cb) => {
    if (allowedExtensions.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé. Formats acceptés : jpg, png, gif, webp, mp4, mov, webm, avi.'));
    }
  },
});

// Envoie un buffer en mémoire vers Cloudinary et retourne le résultat (url, public_id...)
function uploadToCloudinary(buffer, resourceType) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'ahlou-cafe', resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

// GET /api/media?section=live  -> liste publique (utilisée par le site)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.section) filter.section = req.query.section;
    const medias = await Media.find(filter).sort({ createdAt: -1 });
    res.json(medias);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des médias.' });
  }
});

// POST /api/media  (protégé) -> ajouter une image ou une vidéo
router.post('/', requireAuth, (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier reçu.' });
    }
    if (!process.env.CLOUDINARY_URL) {
      return res.status(503).json({
        message: "CLOUDINARY_URL manquant côté serveur. Impossible de stocker le fichier de façon permanente.",
      });
    }

    try {
      const isVideo = /\.(mp4|mov|webm|avi)$/i.test(req.file.originalname);
      const result = await uploadToCloudinary(req.file.buffer, isVideo ? 'video' : 'image');

      const media = new Media({
        type: isVideo ? 'video' : 'image',
        url: result.secure_url,
        filename: result.public_id,
        title: req.body.title || '',
        section: req.body.section || 'live',
      });
      await media.save();
      res.status(201).json(media);
    } catch (saveErr) {
      const isDbIssue = saveErr.name === 'MongooseError' || saveErr.name === 'MongoServerSelectionError' || /buffering timed out/i.test(saveErr.message || '');
      res.status(isDbIssue ? 503 : 500).json({
        message: isDbIssue
          ? "Impossible de contacter la base de données MongoDB Atlas. Vérifiez que le cluster est actif et que l'accès réseau (0.0.0.0/0) est bien autorisé."
          : (saveErr.message || "Erreur lors de l'enregistrement du média."),
      });
    }
  });
});

// DELETE /api/media/:id (protégé) -> supprimer un média
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ message: 'Média introuvable.' });
    }

    // media.filename contient le public_id Cloudinary (ex: ahlou-cafe/abcde123)
    if (media.filename) {
      try {
        await cloudinary.uploader.destroy(media.filename, {
          resource_type: media.type === 'video' ? 'video' : 'image',
        });
      } catch (cloudErr) {
        console.warn('⚠️  Suppression Cloudinary a échoué:', cloudErr.message);
      }
    }

    await media.deleteOne();
    res.json({ message: 'Média supprimé avec succès.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur lors de la suppression.' });
  }
});

module.exports = router;
