import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import formidable from 'formidable';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3006;

// Middleware
app.use(cors());
app.use(express.json());

// Helper for Formidable
const getFormField = (fields, name) => {
    const field = fields[name];
    return (Array.isArray(field) ? field[0] : field) || '';
};

// ─────────────────────────────────────────────────────────────────────
// SCRAPING LOGIC (Improved Headers)
// ─────────────────────────────────────────────────────────────────────

async function downloadImage(url) {
    const ext = (url.split('.').pop() || 'jpg').split('?')[0].toLowerCase().replace(/[^a-z]/g, '') || 'jpg';
    const filename = `artstation_${Date.now()}.${ext}`;
    const dest = path.join(__dirname, 'public/assets/shop', filename);

    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://www.artstation.com/',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
        }
    });

    if (!response.ok) throw new Error(`Failed to download image: ${response.statusText}`);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(dest, buffer);
    return filename;
}

function extractMeta(html, property) {
    const re = new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i');
    const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, 'i');
    return (html.match(re) || html.match(re2) || [])[1] || '';
}

// ── Admin Auth ──────────────────────────────────────────────────────────────
const AUTH_DIR = path.join(__dirname, 'public/assets/admin');
const AUTH_FILE = path.join(AUTH_DIR, 'auth-meta.json');
const DEFAULT_PASS = "1111";

if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });
const getHash = (p) => crypto.createHash('sha256').update(p).digest('hex');

const readAuth = () => {
    if (!fs.existsSync(AUTH_FILE)) {
        const initial = { passwordHash: getHash(DEFAULT_PASS) };
        fs.writeFileSync(AUTH_FILE, JSON.stringify(initial, null, 2));
        return initial;
    }
    return JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));
};

app.post('/api/login', (req, res) => {
    const { password } = req.body;
    const auth = readAuth();
    if (getHash(password) === auth.passwordHash) {
        return res.json({ success: true, token: auth.passwordHash });
    }
    res.status(401).json({ error: 'Invalid password' });
});

app.get('/api/check-auth', (req, res) => {
    const token = req.headers['authorization'];
    const auth = readAuth();
    if (token === auth.passwordHash) return res.json({ success: true });
    res.status(401).json({ error: 'Unauthorized' });
});

app.post('/api/change-password', (req, res) => {
    const token = req.headers['authorization'];
    const auth = readAuth();
    if (token !== auth.passwordHash) return res.status(401).json({ error: 'Unauthorized' });

    const { newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ error: 'Password required' });

    const newHash = getHash(newPassword);
    fs.writeFileSync(AUTH_FILE, JSON.stringify({ passwordHash: newHash }, null, 2));
    res.json({ success: true, token: newHash });
});


app.post('/api/scrape-artstation', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'No URL provided' });

    try {
        // We use a CORS Proxy to bypass Cloudflare blocking.
        // This makes the request appear to come from a browser environment.
        const proxyUrl = 'https://corsproxy.io/?';
        const targetUrl = encodeURIComponent(url);

        const response = await fetch(proxyUrl + targetUrl, {
            headers: {
                // Standard browser headers
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            }
        });

        if (!response.ok) throw new Error(`Proxy returned ${response.status}`);

        const html = await response.text();

        const name = extractMeta(html, 'og:title') || extractMeta(html, 'twitter:title');
        const imageUrl = extractMeta(html, 'og:image') || extractMeta(html, 'twitter:image');
        const description = extractMeta(html, 'og:description');

        const priceMeta = extractMeta(html, 'product:price:amount');
        const priceMatch = html.match(/"price"\s*:\s*"?(\d+(?:\.\d+)?)"?/) || [];
        const price = priceMeta ? `$${priceMeta}` : (priceMatch[1] ? `$${parseFloat(priceMatch[1]).toFixed(2)}` : '');

        let filename = '';
        if (imageUrl) {
            try {
                // Download the image using the same proxy to avoid 403 on the image
                // Note: We decode the image URL because the proxy might have encoded it, 
                // but corsproxy usually passes the URL as is. We need to fetch the image carefully.
                // For images, we usually fetch directly first, but if that fails, proxy is an option.
                // Let's try direct download with headers first, as proxying binary data can be tricky with free proxies.
                filename = await downloadImage(imageUrl);
            } catch (e) {
                console.error('Image download failed, trying proxy:', e);
                // Optional: You could try downloading via proxy here if direct fails
            }
        }

        res.json({ name, description, imageUrl, filename, price, url });

    } catch (error) {
        console.error('Scrape error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────────
// SHOP API
// ─────────────────────────────────────────────────────────────────────

const SHOP_DIR = path.join(__dirname, 'public/assets/shop');
const SHOP_META = path.join(SHOP_DIR, 'shop-meta.json');

if (!fs.existsSync(SHOP_DIR)) fs.mkdirSync(SHOP_DIR, { recursive: true });

function readShopMeta() {
    if (!fs.existsSync(SHOP_META)) return [];
    return JSON.parse(fs.readFileSync(SHOP_META, 'utf-8'));
}

function writeShopMeta(data) {
    fs.writeFileSync(SHOP_META, JSON.stringify(data, null, 2));
}

app.get('/api/shop-items', (req, res) => {
    const meta = readShopMeta();
    res.json(meta.map(m => ({ ...m, src: `/assets/shop/${m.filename}` })));
});

app.post('/api/shop-items', (req, res) => {
    // Handle JSON submission (from ArtStation import)
    const { filename, name, alt, categories, price, link } = req.body;
    const meta = readShopMeta();
    meta.push({
        id: Date.now().toString(),
        filename,
        name,
        alt,
        categories: categories || [], // Updated to use array
        price,
        link
    });
    writeShopMeta(meta);
    res.json({ success: true });
});

// Handle Multipart submission (Manual upload)
app.post('/api/shop-items/upload', (req, res) => {
    const form = formidable({
        uploadDir: SHOP_DIR,
        keepExtensions: true,
        maxFileSize: 10 * 1024 * 1024,
        filename: (_n, _e, part) => `${Date.now()}_${part.originalFilename}`
    });

    form.parse(req, (err, fields, files) => {
        if (err) return res.status(500).json({ error: err.message });
        const uploaded = Array.isArray(files.image) ? files.image[0] : files.image;
        if (!uploaded) return res.status(400).json({ error: 'No file' });

        const filename = path.basename(uploaded.filepath || uploaded.newFilename);
        const meta = readShopMeta();
        meta.push({
            id: Date.now().toString(),
            filename,
            name: getFormField(fields, 'name'),
            alt: getFormField(fields, 'alt'),
            categories: (getFormField(fields, 'categories') || '').split(',').map(c => c.trim()).filter(Boolean),
            price: getFormField(fields, 'price'),
            link: getFormField(fields, 'link')
        });
        writeShopMeta(meta);
        res.json({ success: true });
    });
});

app.patch('/api/shop-items', (req, res) => {
    const { id, ...updates } = req.body;
    const meta = readShopMeta();
    const idx = meta.findIndex(m => m.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    meta[idx] = { ...meta[idx], ...updates };
    writeShopMeta(meta);
    res.json({ success: true });
});

app.delete('/api/shop-items', (req, res) => {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: 'No ID' });

    const meta = readShopMeta();
    const item = meta.find(m => m.id === id);
    if (item) {
        const fp = path.join(SHOP_DIR, item.filename);
        if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
    writeShopMeta(meta.filter(m => m.id !== id));
    res.json({ success: true });
});

// ─────────────────────────────────────────────────────────────────────
// GALLERY API (Concise version - logic same as before)
// ─────────────────────────────────────────────────────────────────────

const GALLERY_DIR = path.join(__dirname, 'public/assets/gallery');
const GALLERY_META = path.join(GALLERY_DIR, 'gallery-meta.json');
if (!fs.existsSync(GALLERY_DIR)) fs.mkdirSync(GALLERY_DIR, { recursive: true });

const readG = () => fs.existsSync(GALLERY_META) ? JSON.parse(fs.readFileSync(GALLERY_META, 'utf-8')) : [];
const writeG = (d) => fs.writeFileSync(GALLERY_META, JSON.stringify(d, null, 2));

app.get('/api/gallery-images', (req, res) => res.json(readG().map(m => ({ ...m, src: `/assets/gallery/${m.filename}` }))));
app.post('/api/gallery-images', (req, res) => {
    const form = formidable({ uploadDir: GALLERY_DIR, keepExtensions: true, maxFileSize: 10 * 1024 * 1024, filename: (_n, _e, p) => `${Date.now()}_${p.originalFilename}` });
    form.parse(req, (err, fields, files) => {
        if (err) return res.status(500).json({ error: err.message });
        const upl = Array.isArray(files.image) ? files.image[0] : files.image;
        const filename = path.basename(upl.filepath || upl.newFilename);
        const meta = readG();
        const maxOrder = meta.reduce((max, m) => Math.max(max, m.order || 0), -1);
        meta.push({ 
            filename, 
            alt: getFormField(fields, 'alt') || filename, 
            categories: (getFormField(fields, 'categories') || '').split(',').map(c => c.trim()).filter(Boolean),
            order: maxOrder + 1,
            link: getFormField(fields, 'link')
        });
        writeG(meta);
        res.json({ success: true, filename });
    });
});
app.patch('/api/gallery-images', (req, res) => {
    const { filename, alt, categories, order, link } = req.body;
    const meta = readG();
    const idx = meta.findIndex(m => m.filename === filename);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    if (alt !== undefined) meta[idx].alt = alt;
    if (categories !== undefined) meta[idx].categories = categories;
    if (order !== undefined) meta[idx].order = order;
    if (link !== undefined) meta[idx].link = link;
    meta.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    writeG(meta);
    res.json({ success: true });
});
app.delete('/api/gallery-images', (req, res) => {
    const file = req.query.file;
    if (file) {
        const fp = path.join(GALLERY_DIR, path.basename(file));
        if (fs.existsSync(fp)) fs.unlinkSync(fp);
        writeG(readG().filter(m => m.filename !== file));
        res.json({ success: true });
    } else res.status(400).json({ error: 'No file' });
});

// ─────────────────────────────────────────────────────────────────────
// HERO & TEAM APIs
// ─────────────────────────────────────────────────────────────────────

const HERO_DIR = path.join(__dirname, 'public/assets/hero');
const HERO_META = path.join(HERO_DIR, 'hero-meta.json');
if (!fs.existsSync(HERO_DIR)) fs.mkdirSync(HERO_DIR, { recursive: true });

const readHeroMeta = () => fs.existsSync(HERO_META) ? JSON.parse(fs.readFileSync(HERO_META, 'utf-8')) : [];
const writeHeroMeta = (d) => fs.writeFileSync(HERO_META, JSON.stringify(d, null, 2));

app.get('/api/hero-images', (req, res) => {
    const files = fs.readdirSync(HERO_DIR).filter(f => /\.(png|jpe?g|gif|webp)$/i.test(f));
    const meta = readHeroMeta();
    let updatedMeta = meta.filter(m => files.includes(m.filename));
    let maxOrder = updatedMeta.reduce((max, m) => Math.max(max, m.order || 0), -1);

    let changed = meta.length !== updatedMeta.length;
    files.forEach(f => {
        if (!updatedMeta.find(m => m.filename === f)) {
            updatedMeta.push({ filename: f, order: ++maxOrder });
            changed = true;
        }
    });

    if (changed || !fs.existsSync(HERO_META)) writeHeroMeta(updatedMeta);
    updatedMeta.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    res.json(updatedMeta.map(m => ({ ...m, src: `/assets/hero/${m.filename}` })));
});

app.post('/api/hero-images', (req, res) => {
    const form = formidable({ uploadDir: HERO_DIR, keepExtensions: true, maxFileSize: 10 * 1024 * 1024, filename: (_n, _e, p) => `${Date.now()}_${p.originalFilename}` });
    form.parse(req, (err, fields, files) => {
        if (err) return res.status(500).json({ error: err.message });
        const upl = Array.isArray(files.image) ? files.image[0] : files.image;
        const filename = path.basename(upl.filepath || upl.newFilename);
        const meta = readHeroMeta();
        const maxOrder = meta.reduce((max, m) => Math.max(max, m.order || 0), -1);
        meta.push({ filename, order: maxOrder + 1, link: '' });
        writeHeroMeta(meta);
        res.json({ success: true, filename });
    });
});

app.patch('/api/hero-images', (req, res) => {
    const { filename, order, link } = req.body;
    const meta = readHeroMeta();
    const idx = meta.findIndex(m => m.filename === filename);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    if (order !== undefined) meta[idx].order = order;
    if (link !== undefined) meta[idx].link = link;
    meta.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    writeHeroMeta(meta);
    res.json({ success: true });
});

app.delete('/api/hero-images', (req, res) => {
    const file = req.query.file;
    if (file) {
        const fp = path.join(HERO_DIR, path.basename(file));
        if (fs.existsSync(fp)) fs.unlinkSync(fp);
        writeHeroMeta(readHeroMeta().filter(m => m.filename !== file));
        res.json({ success: true });
    } else res.status(400).json({ error: 'No file' });
});

// ─────────────────────────────────────────────────────────────────────
// TEAM API (Converted for Express)
// ─────────────────────────────────────────────────────────────────────

const TEAM_DIR = path.join(__dirname, 'public/assets/team');
const TEAM_META = path.join(TEAM_DIR, 'team-meta.json');

// Helper to ensure directory exists
if (!fs.existsSync(TEAM_DIR)) fs.mkdirSync(TEAM_DIR, { recursive: true });

// Helper to read/write meta
const readTeamMeta = () => {
    if (!fs.existsSync(TEAM_META)) return [];
    try { return JSON.parse(fs.readFileSync(TEAM_META, 'utf-8')); } catch { return []; }
};
const writeTeamMeta = (data) => {
    fs.writeFileSync(TEAM_META, JSON.stringify(data, null, 2));
};

// GET: List all team members
app.get('/api/team-members', (req, res) => {
    const meta = readTeamMeta();
    res.json(meta.map(m => ({ ...m, src: `/assets/team/${m.filename}` })));
});

// POST: Add new team member (Upload)
app.post('/api/team-members', (req, res) => {
    const form = formidable({
        uploadDir: TEAM_DIR,
        keepExtensions: true,
        maxFileSize: 10 * 1024 * 1024,
        filename: (_n, _e, part) => `${Date.now()}_${part.originalFilename}`
    });

    form.parse(req, (err, fields, files) => {
        if (err) return res.status(500).json({ error: err.message });

        const uploaded = Array.isArray(files.image) ? files.image[0] : files.image;
        if (!uploaded) return res.status(400).json({ error: 'No file received' });

        const filename = path.basename(uploaded.filepath || uploaded.newFilename);
        const name = getFormField(fields, 'name') || filename;
        const role = getFormField(fields, 'role');
        const order = parseInt(getFormField(fields, 'order') || '0');

        const meta = readTeamMeta();
        meta.push({ filename, name, role, order });

        // Sort by order before saving
        meta.sort((a, b) => a.order - b.order);

        writeTeamMeta(meta);
        res.json({ success: true, filename, name, role, order });
    });
});

// PATCH: Update team member details
app.patch('/api/team-members', (req, res) => {
    // In Express, body is parsed automatically by express.json()
    const { filename, name, role, order } = req.body;

    const meta = readTeamMeta();
    const idx = meta.findIndex(m => m.filename === filename);

    if (idx === -1) return res.status(404).json({ error: 'Not found' });

    meta[idx] = {
        ...meta[idx],
        name: name ?? meta[idx].name,
        role: role ?? meta[idx].role,
        order: order ?? meta[idx].order
    };

    // Sort again if order changed
    meta.sort((a, b) => a.order - b.order);

    writeTeamMeta(meta);
    res.json({ success: true });
});

// DELETE: Remove team member
app.delete('/api/team-members', (req, res) => {
    // In Express, query params are in req.query
    const filename = req.query.file;

    if (filename) {
        const fp = path.join(TEAM_DIR, path.basename(filename));
        if (fs.existsSync(fp)) fs.unlinkSync(fp);

        writeTeamMeta(readTeamMeta().filter(m => m.filename !== filename));
        res.json({ success: true });
    } else {
        res.status(400).json({ error: 'No file specified' });
    }
});

// ─────────────────────────────────────────────────────────────────────
// SERVE STATIC FILES
// ─────────────────────────────────────────────────────────────────────

// Serve assets
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// Serve the built Vite app (dist folder)
app.use(express.static(path.join(__dirname, 'dist')));

// Handle SPA fallback (so React Router works)
app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
});