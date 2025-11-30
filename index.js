
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

        // validar con dns.lookup
        dns.lookup(urlObj.hostname, (err) => {
            if (err) {
                return res.json({ error: "invalid url" });
            }

            const shortUrl = idCounter++;
            urls.push({ shortUrl, originalUrl });

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
    const entry = urls.find(u => u.shortUrl === shortUrl);

    if (!entry) {
        return res.json({ error: "No short URL found" });
    }

    res.redirect(entry.originalUrl);
});

// puerto
const listener = app.listen(port, () => {
    console.log("Listening on port " + listener.address().port);
});