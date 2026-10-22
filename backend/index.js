const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const Item = require("./models/Item");
const mongoose = require("mongoose");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Route d'accueil
app.get("/", (req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Backend MERN</title>
    <style>
      * { box-sizing: border-box; }
      body {
        min-height: 100vh;
        margin: 0;
        display: grid;
        place-items: center;
        padding: 24px;
        font-family: Arial, sans-serif;
        color: #172033;
        background: #f3f6fb;
      }
      main {
        width: min(100%, 620px);
        padding: 40px;
        border: 1px solid #e1e7f0;
        border-radius: 18px;
        background: #fff;
        box-shadow: 0 16px 48px #17203312;
      }
      .status { color: #168452; font-weight: 700; }
      h1 { margin: 12px 0; font-size: clamp(2rem, 7vw, 3rem); }
      p { color: #586579; line-height: 1.6; }
      ul { padding-left: 20px; line-height: 2; }
      a { color: #2457a7; }
      code { padding: 3px 7px; border-radius: 5px; background: #f0f3f8; }
    </style>
  </head>
  <body>
    <main>
      <p class="status">● Serveur en ligne</p>
      <h1>Backend MERN opérationnel</h1>
      <p>Bienvenue ! Cette adresse héberge l’API de votre application.</p>
      <h2>Points d’accès disponibles</h2>
      <ul>
        <li><a href="/api/health"><code>/api/health</code></a> — état du serveur et de MongoDB</li>
        <li><a href="/api/items"><code>/api/items</code></a> — liste des éléments</li>
      </ul>
    </main>
  </body>
</html>`);
});

// Vérifier le serveur et la connexion MongoDB
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

const ensureDatabaseConnection = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Erreur MongoDB :", error.message);
    res.status(503).json({ message: "Base de données indisponible pour le moment." });
  }
};

// Récupérer tous les éléments
app.get("/api/items", ensureDatabaseConnection, async (req, res) => {
try {
const items = await Item.find();
res.status(200).json(items);
} catch (error) {
console.error("Erreur lors de la récupération :", error.message);
res.status(500).json({ message: "Erreur serveur lors de la récupération des éléments" });
}
});

// Ajouter un élément
app.post("/api/items", async (req, res) => {
try {
const { name, description } = req.body;

// Vérifier le nom
if (!name || typeof name !== "string" || !name.trim()) {
  return res.status(400).json({
    message: "Le nom est obligatoire et doit être une chaîne de caractères.",
  });
}

await connectDB();

const item = await Item.create({
  name: name.trim(),
  description: description || "",
});

res.status(201).json(item);

} catch (error) {
console.error("Erreur lors de l'ajout :", error.message);
const databaseUnavailable = mongoose.connection.readyState !== 1;
res.status(databaseUnavailable ? 503 : 500).json({
  message: databaseUnavailable
    ? "Base de données indisponible pour le moment."
    : "Erreur lors de l'ajout de l'élément",
});
}
});

// Démarrer le serveur localement. Vercel utilise l'application exportée ci-dessous.
const PORT = process.env.PORT || 3000;

if (require.main === module && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
  });
  connectDB().catch((error) => {
    console.error("Impossible de se connecter à MongoDB :", error.message);
  });
}

module.exports = app;