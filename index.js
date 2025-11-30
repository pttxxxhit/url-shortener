// javascript
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dns = require("dns");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use("/public", express.static(process.cwd() + "/public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // <- permitir JSON en el body

// Página principal
app.get("/", (req, res) => {
    res.sendFile(process.cwd() + "/views/index.html");
});

// almacenamiento en memoria
let urls = [];
let idCounter = 1;

// POST /api/shorturl
app.post("/api/shorturl", (req, res) => {
    const originalUrl = req.body.url;

    try {
        const urlObj = new URL(originalUrl);

        // Verificar que sea http o https
        if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
            return res.json({ error: "invalid url" });
        }

        // validar con dns.lookup (comprobar también address)
        dns.lookup(urlObj.hostname, (err, address) => {
            if (err || !address) {
                return res.json({ error: "invalid url" });
            }

            const shortUrl = idCounter++;
            // Guardar con las claves que espera la prueba
            urls.push({ short_url: shortUrl, original_url: originalUrl });

            res.json({
                original_url: originalUrl,
                short_url: shortUrl
            });
        });
    } catch (e) {
        return res.json({ error: "invalid url" });
    }
});

// GET /api/shorturl/:short_url
app.get("/api/shorturl/:short_url", (req, res) => {
    const shortUrl = parseInt(req.params.short_url);
    const entry = urls.find(u => u.short_url === shortUrl);

    if (!entry) {
        return res.json({ error: "No short URL found" });
    }

    res.redirect(entry.original_url);
});

// puerto
const listener = app.listen(port, () => {
    console.log("Listening on port " + listener.address().port);
});
