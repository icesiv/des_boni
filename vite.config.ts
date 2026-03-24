import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import fs from "fs"
import formidable from "formidable"

// ── Hero Images API ────────────────────────────────────────────────────────
function heroImagesApiPlugin() {
  return {
    name: 'hero-images-api',
    configureServer(server: any) {
      server.middlewares.use('/api/hero-images', async (req: any, res: any, next: any) => {
        const targetDir = path.resolve(__dirname, './public/assets/hero');
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

        if (req.method === 'GET') {
          const files = fs.readdirSync(targetDir);
          const images = files.filter(f => /\.(png|jpe?g|gif|webp)$/i.test(f)).sort().map(f => `/assets/hero/${f}`);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(images));
          return;
        }

        if (req.method === 'POST') {
          const form = formidable({ uploadDir: targetDir, keepExtensions: true, maxFileSize: 10 * 1024 * 1024, filename: (_n, _e, part) => `${Date.now()}_${part.originalFilename}` });
          form.parse(req, (err) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(err ? JSON.stringify({ error: err.message }) : JSON.stringify({ success: true }));
          });
          return;
        }

        if (req.method === 'DELETE') {
          const qs = new URL(req.url, `http://${req.headers.host}`);
          const filename = qs.searchParams.get('file');
          if (filename) {
            const fp = path.join(targetDir, path.basename(filename));
            if (fs.existsSync(fp)) fs.unlinkSync(fp);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
            return;
          }
        }
        next();
      });
    }
  }
}

// ── Gallery Images API ─────────────────────────────────────────────────────
// Data model: public/assets/gallery/gallery-meta.json
//   [ { filename: "abc.jpg", alt: "...", categories: ["GAMES","3D PRINT"] }, ... ]

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
            const alt = Array.isArray(fields.alt) ? fields.alt[0] : (fields.alt as string) || filename;
            const cats = Array.isArray(fields.categories) ? fields.categories[0] : (fields.categories as string) || '';
            const categories = cats ? cats.split(',').map((c: string) => c.trim()).filter(Boolean) : [];
            const meta = readMeta();
            meta.push({ filename, alt, categories });
            writeMeta(meta);
            json({ success: true, filename, alt, categories });
          });
          return;
        }

        // PATCH /api/gallery-images → update alt/categories for existing image
        if (req.method === 'PATCH') {
          let body = '';
          req.on('data', (c: Buffer) => { body += c; });
          req.on('end', () => {
            try {
              const { filename, alt, categories } = JSON.parse(body);
              const meta = readMeta();
              const idx = meta.findIndex((m: any) => m.filename === filename);
              if (idx === -1) return json({ error: 'Not found' }, 404);
              meta[idx] = { ...meta[idx], alt: alt ?? meta[idx].alt, categories: categories ?? meta[idx].categories };
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

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), heroImagesApiPlugin(), galleryImagesApiPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
