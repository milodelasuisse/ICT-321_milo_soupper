require("dotenv").config();                       // Charge les variables d'environnement depuis le fichier .env

const app = require("./app");                     // Importe l'application Express définie dans app.js

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {                          // Démarre le serveur sur le port choisi
    console.log(`API running on http://localhost:${PORT}`);  // Affiche dans la console l'URL pour accéder à l'API
    if (process.env.NODE_ENV !== 'production') {
        console.log(`Swagger UI: http://localhost:${PORT}/docs`);   //Mise à disposition du Swagger
    }
});