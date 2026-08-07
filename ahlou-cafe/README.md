# Ahlou Café Touba Sourah — Site + Dashboard

Ce projet contient :
- **public/** : le site web (accueil, média, à propos) — HTML/CSS/JS
- **public/admin.html** : le **dashboard** protégé par mot de passe pour ajouter/supprimer des images et vidéos
- **server/** : le petit serveur backend (Node.js + Express) qui connecte tout ça à **MongoDB Atlas**

Quand vous ajoutez une image ou une vidéo depuis le dashboard, elle **apparaît immédiatement** sur le site, dans l'onglet **"Nouveautés"** de la page Média (et dans les onglets Magal 2022/2023/2024/2025 si vous choisissez cette section).

---

## 1. Créer votre base MongoDB Atlas (gratuit)

1. Allez sur https://www.mongodb.com/cloud/atlas/register et créez un compte gratuit.
2. Créez un cluster gratuit (M0).
3. Dans **Database Access**, créez un utilisateur avec un mot de passe (notez-le).
4. Dans **Network Access**, autorisez l'accès depuis n'importe où : `0.0.0.0/0` (simple pour démarrer).
5. Cliquez sur **Connect** > **Drivers**, copiez le lien qui ressemble à :
   ```
   mongodb+srv://VOTRE_USER:VOTRE_MOT_DE_PASSE@votre-cluster.mongodb.net/?retryWrites=true&w=majority
   ```
   Ajoutez le nom de la base après `.net/`, par exemple `.../ahloucafe?retryWrites=true...`

---

## 2. Configurer le serveur

Dans le dossier `server/` :

1. Copiez `.env.example` en `.env` :
   ```
   cp .env.example .env
   ```
2. Ouvrez `.env` et remplissez :
   - `MONGODB_URI` = le lien copié à l'étape précédente
   - `JWT_SECRET` = une longue chaîne aléatoire (ex: générez-en une sur https://randomkeygen.com)
   - `ADMIN_PASSWORD` = le mot de passe que **vous** utiliserez pour vous connecter au dashboard
   - `PORT` = 5000 (ou laissez tel quel)

---

## 3. Lancer le site en local (pour tester)

Il faut Node.js installé (version 18+) : https://nodejs.org

```bash
cd server
npm install
npm start
```

Puis ouvrez dans votre navigateur :
- Site : http://localhost:5000
- Dashboard : http://localhost:5000/admin.html (connectez-vous avec le mot de passe défini dans `.env`)

---

## 4. Mettre le site en ligne (hébergement gratuit avec Render)

Comme le site a maintenant un vrai serveur (pas juste des fichiers HTML), il faut un hébergeur qui exécute Node.js. **Render** propose un plan gratuit simple :

1. Mettez ce dossier sur GitHub (créez un dépôt et poussez le code).
2. Allez sur https://render.com, créez un compte, cliquez sur **New > Web Service**.
3. Connectez votre dépôt GitHub.
4. Configuration :
   - **Root Directory** : `server`
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
5. Dans **Environment Variables**, ajoutez les mêmes variables que dans votre `.env` (`MONGODB_URI`, `JWT_SECRET`, `ADMIN_PASSWORD`). Ne mettez pas `PORT`, Render le gère automatiquement.
6. Cliquez sur **Create Web Service**. Après quelques minutes, votre site sera en ligne à une adresse du type `https://ahlou-cafe.onrender.com`.

Le dashboard sera accessible à `https://ahlou-cafe.onrender.com/admin.html`.

> ⚠️ Sur le plan gratuit de Render, le serveur "s'endort" après 15 minutes sans visite et met quelques secondes à se réveiller à la prochaine visite — c'est normal et gratuit. Pour un site toujours actif, un plan payant (ou Railway/VPS) sera nécessaire.

---

## 5. Utiliser le dashboard

1. Ouvrez `/admin.html`, entrez le mot de passe défini dans `ADMIN_PASSWORD`.
2. Choisissez un titre (optionnel), la section où le média doit apparaître, puis le fichier (image ou vidéo).
3. Cliquez sur **Publier sur le site** : le fichier est envoyé au serveur, sauvegardé, et enregistré dans MongoDB Atlas.
4. Le média apparaît **immédiatement** sur le site public, sans rien recharger côté code.
5. Vous pouvez supprimer n'importe quel média depuis la liste en bas du dashboard.

---

## Sécurité — à retenir

- Ne partagez jamais votre fichier `.env` ni votre `JWT_SECRET`/`ADMIN_PASSWORD`.
- Changez `ADMIN_PASSWORD` régulièrement.
- Les fichiers uploadés sont limités à 150 Mo et aux formats : jpg, png, gif, webp, mp4, mov, webm, avi.
