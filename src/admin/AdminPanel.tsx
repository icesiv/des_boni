import { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, Image as ImageIcon, Edit2, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';

// ── Types ──────────────────────────────────────────────────────────────────
interface HeroImage { url: string; }
interface GalleryImage { filename: string; src: string; alt: string; categories: string[]; }

const PREDEFINED_CATEGORIES = ['GAMES', 'ANIMATION', '3D PRINT', 'CONCEPT', '2D PAINT', 'PORTRAIT', 'ILLUSTRATION', 'GRAPHIC DESIGN'];

// ── Gallery Image Card ─────────────────────────────────────────────────────
function GalleryCard({ image, onDelete, onUpdate }: {
  image: GalleryImage;
  onDelete: (filename: string) => void;
  onUpdate: (filename: string, alt: string, categories: string[]) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [alt, setAlt] = useState(image.alt);
  const [cats, setCats] = useState<string[]>(image.categories);
  const [customCat, setCustomCat] = useState('');

  const toggleCat = (cat: string) => setCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  const addCustom = () => {
    const v = customCat.trim().toUpperCase();
    if (v && !cats.includes(v)) setCats(prev => [...prev, v]);
    setCustomCat('');
  };

  const save = () => { onUpdate(image.filename, alt, cats); setEditing(false); };
  const cancel = () => { setAlt(image.alt); setCats(image.categories); setEditing(false); };

  return (
    <div className="bg-[#0f1724] border border-white/10 rounded-xl overflow-hidden shadow-lg flex flex-col">
      <div className="relative aspect-video group">
        <img src={image.src} alt={image.alt} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button onClick={() => setEditing(true)} className="p-2.5 bg-[#4a9eff]/80 hover:bg-[#4a9eff] text-white rounded-full transition-colors">
            <Edit2 size={18} />
          </button>
          <button onClick={() => onDelete(image.filename)} className="p-2.5 bg-red-500/80 hover:bg-red-600 text-white rounded-full transition-colors">
            <Trash2 size={18} />
          </button>
        </div>
        {/* Category badges */}
        <div className="absolute bottom-1 left-1 flex flex-wrap gap-1 pointer-events-none">
          {image.categories.map(c => (
            <span key={c} className="text-[9px] font-semibold bg-[#4a9eff]/80 text-white px-1.5 py-0.5 rounded-full">{c}</span>
          ))}
        </div>
      </div>

      {editing && (
        <div className="p-4 space-y-3 border-t border-white/10">
          <div>
            <label className="text-xs text-white/50 block mb-1">Alt text</label>
            <input value={alt} onChange={e => setAlt(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-[#4a9eff]" />
          </div>
          <div>
            <label className="text-xs text-white/50 block mb-1">Categories</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PREDEFINED_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => toggleCat(cat)}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${cats.includes(cat) ? 'bg-[#4a9eff] border-[#4a9eff] text-white' : 'border-white/20 text-white/50 hover:border-white/40'}`}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              <input value={customCat} onChange={e => setCustomCat(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustom()}
                placeholder="Custom category…" className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#4a9eff]" />
              <button onClick={addCustom} className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white text-xs rounded transition-colors">Add</button>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={save} className="flex-1 flex items-center justify-center gap-1 bg-[#4a9eff] hover:bg-[#3b82f6] text-white px-3 py-1.5 rounded text-sm font-medium transition-colors">
              <Check size={14} /> Save
            </button>
            <button onClick={cancel} className="flex-1 flex items-center justify-center gap-1 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors">
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}

      {!editing && (
        <p className="px-3 py-2 text-xs text-white/50 truncate border-t border-white/10">{image.alt}</p>
      )}
    </div>
  );
}

// ── Gallery Upload Modal ───────────────────────────────────────────────────
function GalleryUploadModal({ onClose, onDone }: { onClose: () => void; onDone: () => Promise<void> }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [alt, setAlt] = useState('');
  const [cats, setCats] = useState<string[]>([]);
  const [customCat, setCustomCat] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const pick = (f: File) => { setFile(f); setPreview(URL.createObjectURL(f)); setAlt(f.name.replace(/\.[^.]+$/, '')); };
  const toggleCat = (cat: string) => setCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  const addCustom = () => {
    const v = customCat.trim().toUpperCase();
    if (v && !cats.includes(v)) setCats(prev => [...prev, v]);
    setCustomCat('');
  };

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    fd.append('alt', alt);
    fd.append('categories', cats.join(','));
    await fetch('/api/gallery-images', { method: 'POST', body: fd });
    await onDone(); // wait for gallery list to refresh BEFORE closing
    setUploading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-semibold text-white">Upload Gallery Image</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X size={20} /></button>
        </div>

        {/* Drop zone */}
        <div
          onClick={() => fileRef.current?.click()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) pick(f); }}
          onDragOver={e => e.preventDefault()}
          className="cursor-pointer border-2 border-dashed border-white/20 hover:border-[#4a9eff]/60 rounded-xl mb-4 flex items-center justify-center overflow-hidden transition-colors"
          style={{ height: preview ? 'auto' : '140px' }}
        >
          {preview ? (
            <img src={preview} alt="preview" className="w-full rounded-xl object-contain max-h-52" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-white/40">
              <ImageIcon size={36} />
              <span className="text-sm">Click or drag & drop image here</span>
            </div>
          )}
        </div>
        <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && pick(e.target.files[0])} />

        <div className="space-y-4">
          <div>
            <label className="text-xs text-white/50 block mb-1">Alt text</label>
            <input value={alt} onChange={e => setAlt(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4a9eff]" />
          </div>
          <div>
            <label className="text-xs text-white/50 block mb-2">Categories</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PREDEFINED_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => toggleCat(cat)}
                  className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors ${cats.includes(cat) ? 'bg-[#4a9eff] border-[#4a9eff] text-white' : 'border-white/20 text-white/50 hover:border-white/40'}`}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={customCat} onChange={e => setCustomCat(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustom()}
                placeholder="Custom category…" className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4a9eff]" />
              <button onClick={addCustom} className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs rounded transition-colors">Add</button>
            </div>
          </div>
          <button onClick={upload} disabled={!file || uploading}
            className="w-full flex items-center justify-center gap-2 bg-[#4a9eff] hover:bg-[#3b82f6] disabled:opacity-50 text-white py-2.5 rounded-lg font-medium transition-all mt-2">
            <Upload size={16} />
            {uploading ? 'Uploading…' : 'Upload to Gallery'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Admin Panel ────────────────────────────────────────────────────────────
export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'hero' | 'gallery'>('hero');

  // Hero state
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [heroUploading, setHeroUploading] = useState(false);
  const heroFileRef = useRef<HTMLInputElement>(null);

  // Gallery state
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  useEffect(() => { document.title = 'Admin Panel | DCS'; }, []);
  useEffect(() => { fetchHero(); fetchGallery(); }, []);

  const fetchHero = () => fetch('/api/hero-images').then(r => r.json()).then(d => Array.isArray(d) && setHeroImages(d));
  const fetchGallery = () => fetch('/api/gallery-images').then(r => r.json()).then(d => Array.isArray(d) && setGalleryImages(d));

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setHeroUploading(true);
    const fd = new FormData(); fd.append('image', file);
    await fetch('/api/hero-images', { method: 'POST', body: fd });
    await fetchHero(); setHeroUploading(false);
    if (heroFileRef.current) heroFileRef.current.value = '';
  };

  const handleHeroDelete = async (filename: string) => {
    if (!confirm('Delete this image?')) return;
    await fetch(`/api/hero-images?file=${encodeURIComponent(filename)}`, { method: 'DELETE' });
    fetchHero();
  };

  const handleGalleryDelete = async (filename: string) => {
    if (!confirm('Delete this image?')) return;
    await fetch(`/api/gallery-images?file=${encodeURIComponent(filename)}`, { method: 'DELETE' });
    fetchGallery();
  };

  const handleGalleryUpdate = async (filename: string, alt: string, categories: string[]) => {
    await fetch('/api/gallery-images', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename, alt, categories }) });
    fetchGallery();
  };

  return (
    <div className="min-h-screen bg-[#0a1018] text-white">
      {showGalleryModal && <GalleryUploadModal onClose={() => setShowGalleryModal(false)} onDone={fetchGallery} />}

      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-[#0a1018]/95 backdrop-blur border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold font-['Graduate',_sans-serif]">Admin Dashboard</h1>
        <Link to="/" className="text-sm text-[#4a9eff] hover:text-white transition-colors">← Back to Site</Link>
      </div>

      <div className="pt-20 max-w-6xl mx-auto px-4 pb-16">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white/5 rounded-xl p-1.5 w-fit">
          {(['hero', 'gallery'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-[#4a9eff] text-white shadow' : 'text-white/50 hover:text-white'}`}>
              {tab === 'hero' ? '🎠 Hero Carousel' : '🖼️ Gallery'}
            </button>
          ))}
        </div>

        {/* Hero Tab */}
        {activeTab === 'hero' && (
          <div className="bg-[#1a1f2e] border border-white/10 rounded-xl p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold mb-1">Hero Carousel Images</h2>
                <p className="text-[#a0aec0] text-sm">Images shown in the homepage slider. Order is alphabetical by filename.</p>
              </div>
              <button onClick={() => heroFileRef.current?.click()} disabled={heroUploading}
                className="flex items-center gap-2 bg-[#4a9eff] hover:bg-[#3b82f6] text-white px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 whitespace-nowrap">
                <Upload size={16} />
                {heroUploading ? 'Uploading…' : 'Upload Image'}
              </button>
              <input type="file" ref={heroFileRef} className="hidden" accept="image/*" onChange={handleHeroUpload} />
            </div>

            {heroImages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 border border-white/10 border-dashed rounded-lg bg-white/5 gap-3">
                <ImageIcon size={40} className="text-white/20" />
                <p className="text-[#a0aec0]">No hero images yet. Upload some to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {heroImages.map((url, i) => (
                  <div key={url} className="group relative aspect-video bg-black/50 rounded-lg overflow-hidden border border-white/10">
                    <img src={url} alt={`Slide ${i}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => handleHeroDelete(url.split('/').pop() || url)} className="p-2.5 bg-red-500/80 hover:bg-red-600 text-white rounded-full transition-colors">
                        <Trash2 size={20} />
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
                      <p className="text-[10px] text-white/60 truncate">{url.split('/').pop()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div className="bg-[#1a1f2e] border border-white/10 rounded-xl p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold mb-1">Gallery Images</h2>
                <p className="text-[#a0aec0] text-sm">Assign multiple categories per image. Hover to edit or delete.</p>
              </div>
              <button onClick={() => setShowGalleryModal(true)}
                className="flex items-center gap-2 bg-[#4a9eff] hover:bg-[#3b82f6] text-white px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap">
                <Upload size={16} /> Upload Image
              </button>
            </div>

            {galleryImages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 border border-white/10 border-dashed rounded-lg bg-white/5 gap-3">
                <ImageIcon size={40} className="text-white/20" />
                <p className="text-[#a0aec0]">No gallery images yet. Upload some to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {galleryImages.map(image => (
                  <GalleryCard key={image.filename} image={image} onDelete={handleGalleryDelete} onUpdate={handleGalleryUpdate} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
