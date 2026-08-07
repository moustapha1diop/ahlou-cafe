const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const Media = require('../models/Media');
const requireAuth = require('../middleware/auth');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Stockage des fichiers sur le disque du serveur
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

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

    try {
      const isVideo = /\.(mp4|mov|webm|avi)$/i.test(req.file.originalname);
      const media = new Media({
        type: isVideo ? 'video' : 'image',
        url: `/uploads/${req.file.filename}`,
        filename: req.file.filename,
        title: req.body.title || '',
        section: req.body.section || 'live',
      });
      await media.save();
      res.status(201).json(media);
    } catch (saveErr) {
      res.status(500).json({ message: 'Erreur lors de l\'enregistrement en base de données.' });
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

    const filePath = path.join(uploadDir, media.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await media.deleteOne();
    res.json({ message: 'Média supprimé avec succès.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur lors de la suppression.' });
  }
});

module.exports = router;
