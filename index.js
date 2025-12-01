// javascript
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dns = require("dns");
const app = express();

// Config
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Página principal
app.get("/", (req, res) => {
    res.sendFile(process.cwd() + "/views/index.html");
});

// Almacenamiento en memoria
const urlsById = {};
let idCounter = 1;

// POST /api/shorturl
// POST /api/shorturl

app.post("/api/shorturl", (req, res) => {
    const originalUrl = req.body.url;
    console.log("POST /api/shorturl body:", req.body);

    if (!originalUrl) {
        return res.json({ error: "invalid url" });
    }

    let urlObj;
    try {
        urlObj = new URL(originalUrl);
    } catch (e) {
        return res.json({ error: "invalid url" });
    }

    if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
        return res.json({ error: "invalid url" });
    }

    // DNS lookup con timeout de 3 segundos
    const timeoutMs = 3000;
    let responded = false;

    const timeout = setTimeout(() => {
        if (!responded) {
            responded = true;
            console.log("DNS lookup timeout for", urlObj.hostname);
            return res.json({ error: "invalid url" });
        }
    }, timeoutMs);

    dns.lookup(urlObj.hostname, (err, address) => {
        clearTimeout(timeout);

        if (responded) return; // Ya respondimos por timeout
        responded = true;

        if (err || !address) {
            console.log("DNS lookup failed for", urlObj.hostname, err);
            return res.json({ error: "invalid url" });
        }

        const shortUrl = idCounter++;
        urlsById[shortUrl] = originalUrl;

        console.log("Created short url:", shortUrl, "->", originalUrl);

        return res.json({
            original_url: originalUrl,
            short_url: shortUrl
        });
    });
});


// GET /api/shorturl/:short_url
app.get("/api/shorturl/:short_url", (req, res) => {
    const shortUrl = parseInt(req.params.short_url);
    console.log("GET /api/shorturl/", shortUrl);

    const original = urlsById[shortUrl];
    if (!original) {
        return res.status(404).json({ error: "No short URL found" });
    }

    return res.redirect(original);
});

// Start
const listener = app.listen(port, () => {
    console.log("Listening on port " + listener.address().port);
});

// Export app for automated tests
module.exports = app;
