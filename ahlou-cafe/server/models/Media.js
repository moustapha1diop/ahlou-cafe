const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true,
  },
  url: {
    type: String, // ex: /uploads/1699999999-123456789.jpg
    required: true,
  },
  filename: {
    type: String, // nom du fichier sur le disque, utilisé pour la suppression
    required: true,
  },
  title: {
    type: String,
    default: '',
    trim: true,
  },
  // section permet de ranger le média dans un des onglets du site
  // valeurs utilisées par le site: "live", "magal2022", "magal2023", "magal2024", "magal2025", "about"
  section: {
    type: String,
    default: 'live',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Media', mediaSchema);
