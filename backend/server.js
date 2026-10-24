const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Link = require('./models/Url');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch((err) => console.error('MongoDB Connection Error:', err));

// 1. POST: Generate Short Link (with Custom Alias support)
app.post('/api/shorten', async (req, res) => {
    const { originalUrl, customAlias } = req.body;
    if (!originalUrl) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        let shortCode = customAlias && customAlias.trim() !== '' ? customAlias.trim() : null;

        if (shortCode) {
            // Check if custom alias already exists
            const existing = await Link.findOne({ shortCode });
            if (existing) {
                return res.status(400).json({ error: 'Custom alias is already taken! Try another.' });
            }
        } else {
            const { nanoid } = await import('nanoid');
            shortCode = nanoid(6);
        }

        const newLink = new Link({
            originalUrl,
            shortCode,
            clicks: 0
        });

        await newLink.save();
        res.json({
            originalUrl,
            shortCode,
            shortUrl: `${process.env.BASE_URL}/${shortCode}`
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 2. GET: Redirect to Original URL & Track Clicks
app.get('/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const linkDoc = await Link.findOne({ shortCode: code });

        if (!linkDoc) {
            return res.status(404).json({ error: 'URL not found' });
        }

        linkDoc.clicks++;
        await linkDoc.save();

        return res.redirect(linkDoc.originalUrl);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 3. GET: Fetch Analytics for a Short Code
app.get('/api/analytics/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const linkDoc = await Link.findOne({ shortCode: code });

        if (!linkDoc) {
            return res.status(404).json({ error: 'URL not found' });
        }

        res.json({
            originalUrl: linkDoc.originalUrl,
            shortCode: linkDoc.shortCode,
            clicks: linkDoc.clicks,
            createdAt: linkDoc.createdAt
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});