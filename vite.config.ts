import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import fs from "fs"
import formidable from "formidable"

const getFormField = (fields: formidable.Fields, name: string) => {
  const field = fields[name];
  return (Array.isArray(field) ? field[0] : (field as unknown as string)) || '';
};

// ── Hero Images API ────────────────────────────────────────────────────────
function heroImagesApiPlugin() {
  const IMG_DIR = path.resolve(__dirname, './public/assets/hero');
  const META_FILE = path.join(IMG_DIR, 'hero-meta.json');

  function readMeta() {
    if (!fs.existsSync(META_FILE)) return [];
    try { return JSON.parse(fs.readFileSync(META_FILE, 'utf-8')); } catch { return []; }
  }
  function writeMeta(data: any[]) {
    fs.writeFileSync(META_FILE, JSON.stringify(data, null, 2));
  }

  return {
    name: 'hero-images-api',
    configureServer(server: any) {
      server.middlewares.use('/api/hero-images', async (req: any, res: any, next: any) => {
        if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });

        const json = (data: any, status = 200) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        };

        if (req.method === 'GET') {
          const files = fs.readdirSync(IMG_DIR).filter(f => /\.(png|jpe?g|gif|webp)$/i.test(f));
          const meta = readMeta();
          
          // Sync meta with files
          let updatedMeta = meta.filter((m: any) => files.includes(m.filename));
          let maxOrder = updatedMeta.reduce((max: number, m: any) => Math.max(max, m.order || 0), -1);
          
          let changed = meta.length !== updatedMeta.length;
          files.forEach(f => {
            if (!updatedMeta.find((m: any) => m.filename === f)) {
              updatedMeta.push({ filename: f, order: ++maxOrder });
              changed = true;
            }
          });
          
          if (changed || !fs.existsSync(META_FILE)) {
            writeMeta(updatedMeta);
          }
          
          updatedMeta.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
          return json(updatedMeta.map((m: any) => ({ ...m, src: `/assets/hero/${m.filename}` })));
        }

        if (req.method === 'POST') {
          const form = formidable({ uploadDir: IMG_DIR, keepExtensions: true, maxFileSize: 10 * 1024 * 1024, filename: (_n, _e, part) => `${Date.now()}_${part.originalFilename}` });
          form.parse(req, (err, _fields, files) => {
            if (err) return json({ error: err.message }, 500);
            const uploaded = Array.isArray(files.image) ? files.image[0] : (files.image as any);
            if (uploaded) {
              const filename = path.basename(uploaded.filepath || uploaded.newFilename || uploaded.path);
              const meta = readMeta();
              const maxOrder = meta.reduce((max: number, m: any) => Math.max(max, m.order || 0), -1);
              meta.push({ filename, order: maxOrder + 1 });
              writeMeta(meta);
            }
            json({ success: true });
          });
          return;
        }

        if (req.method === 'PATCH') {
          let body = '';
          req.on('data', (c: Buffer) => { body += c; });
          req.on('end', () => {
            try {
              const { filename, order } = JSON.parse(body);
              const meta = readMeta();
              const idx = meta.findIndex((m: any) => m.filename === filename);
              if (idx === -1) return json({ error: 'Not found' }, 404);
              if (order !== undefined) meta[idx].order = order;
              meta.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
              writeMeta(meta);
              json({ success: true });
            } catch { json({ error: 'Invalid JSON' }, 400); }
          });
          return;
        }

        if (req.method === 'DELETE') {
          const qs = new URL(req.url, `http://${req.headers.host}`);
          const filename = qs.searchParams.get('file');
          if (filename) {
            const basename = path.basename(filename);
            const fp = path.join(IMG_DIR, basename);
            if (fs.existsSync(fp)) fs.unlinkSync(fp);
            const meta = readMeta().filter((m: any) => m.filename !== basename);
            writeMeta(meta);
            return json({ success: true });
          }
        }
        next();
      });
    }
  }
}

// ── Gallery Images API ─────────────────────────────────────────────────────
// Data model: public/assets/gallery/gallery-meta.json
//   [ { filename: "abc.jpg", alt: "...", categories: ["GAMES","3D PRINT"], order: 0 }, ... ]

function galleryImagesApiPlugin() {
  const IMG_DIR = path.resolve(__dirname, './public/assets/gallery');
  const META_FILE = path.join(IMG_DIR, 'gallery-meta.json');

  function readMeta() {
    if (!fs.existsSync(META_FILE)) return [];
    try { return JSON.parse(fs.readFileSync(META_FILE, 'utf-8')); } catch { return []; }
  }
  function writeMeta(data: any[]) {
    fs.writeFileSync(META_FILE, JSON.stringify(data, null, 2));
  }

  return {
    name: 'gallery-images-api',
    configureServer(server: any) {
      server.middlewares.use('/api/gallery-images', async (req: any, res: any, next: any) => {
        if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });

        const json = (data: any, status = 200) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        };

        // GET → list all with metadata
        if (req.method === 'GET') {
          const meta = readMeta();
          meta.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
          // Enrich with full src path
          const result = meta.map((m: any) => ({ ...m, src: `/assets/gallery/${m.filename}` }));
          return json(result);
        }

        // POST /api/gallery-images → upload new image (multipart)
        //      Body may also contain fields: alt, categories (comma-separated)
        if (req.method === 'POST') {
          const form = formidable({
            uploadDir: IMG_DIR, keepExtensions: true, maxFileSize: 10 * 1024 * 1024,
            filename: (_n, _e, part) => `${Date.now()}_${part.originalFilename}`
          });
          form.parse(req, (err, fields, files) => {
            if (err) return json({ error: err.message }, 500);
            const uploaded = Array.isArray(files.image) ? files.image[0] : (files.image as any);
            if (!uploaded) return json({ error: 'No file received' }, 400);
            const filename = path.basename(uploaded.filepath || uploaded.newFilename || uploaded.path);
            const alt = getFormField(fields, 'alt') || filename;
            const cats = getFormField(fields, 'categories');
            const categories = cats ? cats.split(',').map((c: string) => c.trim()).filter(Boolean) : [];
            const meta = readMeta();
            const maxOrder = meta.reduce((max: number, m: any) => Math.max(max, m.order || 0), -1);
            meta.push({ filename, alt, categories, order: maxOrder + 1 });
            writeMeta(meta);
            json({ success: true, filename, alt, categories });
          });
          return;
        }

        // PATCH /api/gallery-images → update alt/categories/order for existing image
        if (req.method === 'PATCH') {
          let body = '';
          req.on('data', (c: Buffer) => { body += c; });
          req.on('end', () => {
            try {
              const { filename, alt, categories, order } = JSON.parse(body);
              const meta = readMeta();
              const idx = meta.findIndex((m: any) => m.filename === filename);
              if (idx === -1) return json({ error: 'Not found' }, 404);
              meta[idx] = { 
                ...meta[idx], 
                alt: alt ?? meta[idx].alt, 
                categories: categories ?? meta[idx].categories,
                order: order ?? meta[idx].order
              };
              meta.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
              writeMeta(meta);
              json({ success: true });
            } catch { json({ error: 'Invalid JSON' }, 400); }
          });
          return;
        }

        // DELETE /api/gallery-images?file=filename
        if (req.method === 'DELETE') {
          const qs = new URL(req.url, `http://${req.headers.host}`);
          const filename = qs.searchParams.get('file');
          if (filename) {
            const fp = path.join(IMG_DIR, path.basename(filename));
            if (fs.existsSync(fp)) fs.unlinkSync(fp);
            const meta = readMeta().filter((m: any) => m.filename !== filename);
            writeMeta(meta);
            return json({ success: true });
          }
        }

        next();
      });
    }
  }
}

// ── Team Members API ───────────────────────────────────────────────────────
// Data model: public/assets/team/team-meta.json
//   [ { filename: "abc.jpg", name: "...", role: "...", order: 0 }, ... ]

function teamMembersApiPlugin() {
  const IMG_DIR = path.resolve(__dirname, './public/assets/team');
  const META_FILE = path.join(IMG_DIR, 'team-meta.json');

  function readMeta() {
    if (!fs.existsSync(META_FILE)) return [];
    try { return JSON.parse(fs.readFileSync(META_FILE, 'utf-8')); } catch { return []; }
  }
  function writeMeta(data: any[]) {
    fs.writeFileSync(META_FILE, JSON.stringify(data, null, 2));
  }

  return {
    name: 'team-members-api',
    configureServer(server: any) {
      server.middlewares.use('/api/team-members', async (req: any, res: any, next: any) => {
        if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });

        const json = (data: any, status = 200) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        };

        if (req.method === 'GET') {
          const meta = readMeta();
          meta.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
          return json(meta.map((m: any) => ({ ...m, src: `/assets/team/${m.filename}` })));
        }

        if (req.method === 'POST') {
          const form = formidable({
            uploadDir: IMG_DIR, keepExtensions: true, maxFileSize: 10 * 1024 * 1024,
            filename: (_n, _e, part) => `${Date.now()}_${part.originalFilename}`
          });
          form.parse(req, (err, fields, files) => {
            if (err) return json({ error: err.message }, 500);
            const uploaded = Array.isArray(files.image) ? files.image[0] : (files.image as any);
            if (!uploaded) return json({ error: 'No file received' }, 400);
            const filename = path.basename(uploaded.filepath || uploaded.newFilename || uploaded.path);
            const name = getFormField(fields, 'name') || filename;
            const role = getFormField(fields, 'role');
            const order = parseInt(getFormField(fields, 'order') || '0');
            const meta = readMeta();
            meta.push({ filename, name, role, order });
            meta.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
            writeMeta(meta);
            json({ success: true, filename, name, role, order });
          });
          return;
        }

        if (req.method === 'PATCH') {
          let body = '';
          req.on('data', (c: Buffer) => { body += c; });
          req.on('end', () => {
            try {
              const { filename, name, role, order } = JSON.parse(body);
              const meta = readMeta();
              const idx = meta.findIndex((m: any) => m.filename === filename);
              if (idx === -1) return json({ error: 'Not found' }, 404);
              meta[idx] = { ...meta[idx], name: name ?? meta[idx].name, role: role ?? meta[idx].role, order: order ?? meta[idx].order };
              meta.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
              writeMeta(meta);
              json({ success: true });
            } catch { json({ error: 'Invalid JSON' }, 400); }
          });
          return;
        }

        if (req.method === 'DELETE') {
          const qs = new URL(req.url, `http://${req.headers.host}`);
          const filename = qs.searchParams.get('file');
          if (filename) {
            const fp = path.join(IMG_DIR, path.basename(filename));
            if (fs.existsSync(fp)) fs.unlinkSync(fp);
            writeMeta(readMeta().filter((m: any) => m.filename !== filename));
            return json({ success: true });
          }
        }

        next();
      });
    }
  }
}

// ── Shop Items API ─────────────────────────────────────────────────────────
function shopItemsApiPlugin() {
  const IMG_DIR = path.resolve(__dirname, './public/assets/shop');
  const META_FILE = path.join(IMG_DIR, 'shop-meta.json');

  function readMeta() {
    if (!fs.existsSync(META_FILE)) return [];
    try { return JSON.parse(fs.readFileSync(META_FILE, 'utf-8')); } catch { return []; }
  }
  function writeMeta(data: any[]) { fs.writeFileSync(META_FILE, JSON.stringify(data, null, 2)); }

  async function downloadImage(url: string): Promise<string> {
    const https = await import('https');
    const http = await import('http');
    const { URL: NodeURL } = await import('url');
    const parsed = new NodeURL(url);
    const ext = (parsed.pathname.split('.').pop() || 'jpg').split('?')[0].toLowerCase().replace(/[^a-z]/g, '') || 'jpg';
    const filename = `artstation_${Date.now()}.${ext}`;
    const dest = path.join(IMG_DIR, filename);
    return new Promise((resolve, reject) => {
      const proto = parsed.protocol === 'https:' ? https.default : http.default;
      proto.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res: any) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          downloadImage(res.headers.location).then(resolve).catch(reject); return;
        }
        const stream = fs.createWriteStream(dest);
        res.pipe(stream);
        stream.on('finish', () => { stream.close(); resolve(filename); });
        stream.on('error', reject);
      }).on('error', reject);
    });
  }

  function extractMeta(html: string, property: string): string {
    const re = new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i');
    const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, 'i');
    return (html.match(re) || html.match(re2) || [])[1] || '';
  }

  return {
    name: 'shop-items-api',
    configureServer(server: any) {

      // Scrape ArtStation (or any URL) for og meta
      server.middlewares.use('/api/scrape-artstation', async (req: any, res: any, next: any) => {
        if (req.method !== 'POST') return next();
        if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });
        const json = (data: any, status = 200) => { res.statusCode = status; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); };

        let body = '';
        req.on('data', (c: Buffer) => { body += c; });
        req.on('end', async () => {
          try {
            const { url } = JSON.parse(body);
            if (!url) return json({ error: 'No URL provided' }, 400);

            const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 AppleWebKit/537.36 Chrome/120', Accept: 'text/html' } });
            const html = await resp.text();

            const name = extractMeta(html, 'og:title') || extractMeta(html, 'twitter:title');
            const imageUrl = extractMeta(html, 'og:image') || extractMeta(html, 'twitter:image');
            const description = extractMeta(html, 'og:description') || extractMeta(html, 'twitter:description');
            const priceMeta = extractMeta(html, 'product:price:amount');
            const priceMatch = html.match(/"price"\s*:\s*"?(\d+(?:\.\d+)?)"?/) || [];
            const price = priceMeta ? `$${priceMeta}` : (priceMatch[1] ? `$${parseFloat(priceMatch[1]).toFixed(2)}` : '');

            let filename = '';
            if (imageUrl) {
              try { filename = await downloadImage(imageUrl); } catch (e) { console.error('Image download failed:', e); }
            }
            json({ name, description, imageUrl, filename, price, url });
          } catch (e: any) { json({ error: e.message }, 500); }
        });
      });

      // Shop items CRUD
      server.middlewares.use('/api/shop-items', async (req: any, res: any, next: any) => {
        if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });
        const json = (data: any, status = 200) => { res.statusCode = status; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); };

        if (req.method === 'GET') {
          const meta = readMeta();
          meta.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
          return json(meta.map((m: any) => ({ ...m, src: `/assets/shop/${m.filename}` })));
        }

        if (req.method === 'POST') {
          const ct = req.headers['content-type'] || '';
          if (ct.includes('multipart')) {
            const form = formidable({ uploadDir: IMG_DIR, keepExtensions: true, maxFileSize: 10 * 1024 * 1024, filename: (_n, _e, part) => `${Date.now()}_${part.originalFilename}` });
            form.parse(req, (err: any, fields: any, files: any) => {
              if (err) return json({ error: err.message }, 500);
              const uploaded = Array.isArray(files.image) ? files.image[0] : files.image;
              if (!uploaded) return json({ error: 'No file' }, 400);
              const filename = path.basename(uploaded.filepath || uploaded.newFilename || uploaded.path);
              const meta = readMeta();
              const maxOrder = meta.reduce((max: number, m: any) => Math.max(max, m.order || 0), -1);
              meta.push({
                id: Date.now().toString(),
                filename,
                name: getFormField(fields, 'name'),
                alt: getFormField(fields, 'alt'),
                category: getFormField(fields, 'category'),
                price: getFormField(fields, 'price'),
                link: getFormField(fields, 'link'),
                order: maxOrder + 1
              });
              writeMeta(meta);
              json({ success: true });
            });
          } else {
            let body = '';
            req.on('data', (c: Buffer) => { body += c; });
            req.on('end', () => {
              try {
                const { filename, name, alt, category, price, link } = JSON.parse(body);
                const meta = readMeta();
                const maxOrder = meta.reduce((max: number, m: any) => Math.max(max, m.order || 0), -1);
                meta.push({ id: Date.now().toString(), filename, name, alt, category, price, link, order: maxOrder + 1 });
                writeMeta(meta);
                json({ success: true });
              } catch { json({ error: 'Invalid JSON' }, 400); }
            });
          }
          return;
        }

        if (req.method === 'PATCH') {
          let body = '';
          req.on('data', (c: Buffer) => { body += c; });
          req.on('end', () => {
            try {
              const { id, ...updates } = JSON.parse(body);
              const meta = readMeta();
              const idx = meta.findIndex((m: any) => m.id === id);
              if (idx === -1) return json({ error: 'Not found' }, 404);
              meta[idx] = { ...meta[idx], ...updates };
              meta.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
              writeMeta(meta);
              json({ success: true });
            } catch { json({ error: 'Invalid JSON' }, 400); }
          });
          return;
        }

        if (req.method === 'DELETE') {
          const qs = new URL(req.url, `http://${req.headers.host}`);
          const id = qs.searchParams.get('id');
          if (id) {
            const meta = readMeta();
            const item = meta.find((m: any) => m.id === id);
            if (item) { const fp = path.join(IMG_DIR, item.filename); if (fs.existsSync(fp)) fs.unlinkSync(fp); }
            writeMeta(meta.filter((m: any) => m.id !== id));
            return json({ success: true });
          }
        }
        next();
      });
    }
  }
}


// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), heroImagesApiPlugin(), galleryImagesApiPlugin(), teamMembersApiPlugin(), shopItemsApiPlugin()],
  preview: {
    allowedHosts: [
      'des.pure-fix.com'
    ]
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
