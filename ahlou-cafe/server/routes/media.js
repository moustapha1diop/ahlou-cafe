const express = require('express');
const multer = require('multer');

const cloudinary = require('../config/cloudinary');
const Media = require('../models/Media');
const requireAuth = require('../middleware/auth');

const router = express.Router();

const allowedExtensions = /\.(jpe?g|png|gif|webp|mp4|mov|webm|avi)$/i;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 150 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (allowedExtensions.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé. Formats acceptés : jpg, png, gif, webp, mp4, mov, webm, avi.'));
    }
  },
});

function uploadBufferToCloudinary(buffer, resourceType) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'ahlou-cafe', resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

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
      const resourceType = isVideo ? 'video' : 'image';

      const result = await uploadBufferToCloudinary(req.file.buffer, resourceType);

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
      res.status(500).json({ message: "Erreur lors de l'envoi vers Cloudinary ou de l'enregistrement en base." });
    }
  });
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ message: 'Média introuvable.' });
    }

    try {
      await cloudinary.uploader.destroy(media.filename, {
        resource_type: media.type === 'video' ? 'video' : 'image',
      });
    } catch (cloudErr) {}

    await media.deleteOne();
    res.json({ message: 'Média supprimé avec succès.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur lors de la suppression.' });
  }
});

module.exports = router;
