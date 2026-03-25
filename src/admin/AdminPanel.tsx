import { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, Image as ImageIcon, Edit2, Check, X, Link as LinkIcon, Loader2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

// ── Types ──────────────────────────────────────────────────────────────────
interface HeroImage { url: string; }
interface GalleryImage { filename: string; src: string; alt: string; categories: string[]; }
interface TeamMember { filename: string; src: string; name: string; role: string; order: number; }
interface ShopItem { id: string; filename: string; src: string; name: string; alt: string; category: string; price: string; link?: string; }

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

// ── Team Member Card ─────────────────────────────────────────────────────────
function TeamCard({ member, onDelete, onUpdate }: {
  member: TeamMember;
  onDelete: (filename: string) => void;
  onUpdate: (filename: string, name: string, role: string, order: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(member.name);
  const [role, setRole] = useState(member.role);
  const [order, setOrder] = useState(member.order);

  const save = () => { onUpdate(member.filename, name, role, order); setEditing(false); };
  const cancel = () => { setName(member.name); setRole(member.role); setOrder(member.order); setEditing(false); };

  return (
    <div className="bg-[#0f1724] border border-white/10 rounded-xl overflow-hidden shadow-lg flex flex-col">
      <div className="relative group">
        <img src={member.src} alt={member.name} className="w-full aspect-square object-cover" />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button onClick={() => setEditing(true)} className="p-2.5 bg-[#4a9eff]/80 hover:bg-[#4a9eff] text-white rounded-full transition-colors"><Edit2 size={18} /></button>
          <button onClick={() => onDelete(member.filename)} className="p-2.5 bg-red-500/80 hover:bg-red-600 text-white rounded-full transition-colors"><Trash2 size={18} /></button>
        </div>
        <div className="absolute top-2 right-2 text-[10px] bg-black/60 text-white/60 px-1.5 py-0.5 rounded">#{member.order}</div>
      </div>

      {editing ? (
        <div className="p-4 space-y-3 border-t border-white/10">
          <div>
            <label className="text-xs text-white/50 block mb-1">Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-[#4a9eff]" />
          </div>
          <div>
            <label className="text-xs text-white/50 block mb-1">Role</label>
            <input value={role} onChange={e => setRole(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-[#4a9eff]" />
          </div>
          <div>
            <label className="text-xs text-white/50 block mb-1">Order (lower = first)</label>
            <input type="number" value={order} onChange={e => setOrder(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-[#4a9eff]" />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={save} className="flex-1 flex items-center justify-center gap-1 bg-[#4a9eff] hover:bg-[#3b82f6] text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"><Check size={14} /> Save</button>
            <button onClick={cancel} className="flex-1 flex items-center justify-center gap-1 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"><X size={14} /> Cancel</button>
          </div>
        </div>
      ) : (
        <div className="px-3 py-2 border-t border-white/10">
          <p className="text-sm font-semibold text-white truncate">{member.name}</p>
          <p className="text-xs text-white/50">{member.role}</p>
        </div>
      )}
    </div>
  );
}

// ── Team Upload Modal ─────────────────────────────────────────────────────────
function TeamUploadModal({ onClose, onDone }: { onClose: () => void; onDone: () => Promise<void> }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [order, setOrder] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const pick = (f: File) => { setFile(f); setPreview(URL.createObjectURL(f)); setName(f.name.replace(/\.[^.]+$/, '')); };

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    fd.append('name', name);
    fd.append('role', role);
    fd.append('order', String(order));
    await fetch('/api/team-members', { method: 'POST', body: fd });
    await onDone();
    setUploading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-semibold text-white">Add Team Member</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X size={20} /></button>
        </div>

        <div
          onClick={() => fileRef.current?.click()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) pick(f); }}
          onDragOver={e => e.preventDefault()}
          className="cursor-pointer border-2 border-dashed border-white/20 hover:border-[#4a9eff]/60 rounded-xl mb-4 flex items-center justify-center overflow-hidden transition-colors"
          style={{ height: preview ? 'auto' : '140px' }}
        >
          {preview
            ? <img src={preview} alt="preview" className="w-full rounded-xl object-contain max-h-52" />
            : <div className="flex flex-col items-center gap-2 text-white/40"><ImageIcon size={36} /><span className="text-sm">Click or drag photo here</span></div>}
        </div>
        <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && pick(e.target.files[0])} />

        <div className="space-y-3">
          <div>
            <label className="text-xs text-white/50 block mb-1">Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4a9eff]" />
          </div>
          <div>
            <label className="text-xs text-white/50 block mb-1">Role / Title</label>
            <input value={role} onChange={e => setRole(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4a9eff]" />
          </div>
          <div>
            <label className="text-xs text-white/50 block mb-1">Display Order (lower = first)</label>
            <input type="number" value={order} onChange={e => setOrder(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4a9eff]" />
          </div>
          <button onClick={upload} disabled={!file || uploading}
            className="w-full flex items-center justify-center gap-2 bg-[#4a9eff] hover:bg-[#3b82f6] disabled:opacity-50 text-white py-2.5 rounded-lg font-medium transition-all mt-2">
            <Upload size={16} />{uploading ? 'Uploading…' : 'Add Member'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Shop Item Card ──────────────────────────────────────────────
function ShopCard({ item, onDelete, onUpdate }: {
  item: ShopItem;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ShopItem>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(item.price);
  const [category, setCategory] = useState(item.category);
  const [link, setLink] = useState(item.link || '');

  const save = () => { onUpdate(item.id, { name, price, category, link }); setEditing(false); };
  const cancel = () => { setName(item.name); setPrice(item.price); setCategory(item.category); setLink(item.link || ''); setEditing(false); };

  return (
    <div className="bg-[#0f1724] border border-white/10 rounded-xl overflow-hidden shadow-lg flex flex-col">
      <div className="relative aspect-square group">
        <img src={item.src} alt={item.alt} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button onClick={() => setEditing(true)} className="p-2.5 bg-[#4a9eff]/80 hover:bg-[#4a9eff] text-white rounded-full"><Edit2 size={18} /></button>
          <button onClick={() => onDelete(item.id)} className="p-2.5 bg-red-500/80 hover:bg-red-600 text-white rounded-full"><Trash2 size={18} /></button>
        </div>
        <div className="absolute top-2 left-2 flex gap-1 pointer-events-none">
          {item.price && <span className="text-[9px] font-bold bg-[#4a9eff]/80 text-white px-1.5 py-0.5 rounded-full">{item.price}</span>}
        </div>
      </div>

      {editing ? (
        <div className="p-3 space-y-2 border-t border-white/10">
          {[['Name', name, setName], ['Price', price, setPrice], ['Category', category, setCategory], ['Link URL', link, setLink]].map(([label, val, set]) => (
            <div key={label as string}>
              <label className="text-[10px] text-white/50 block mb-0.5">{label as string}</label>
              <input value={val as string} onChange={e => (set as any)(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#4a9eff]" />
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <button onClick={save} className="flex-1 flex items-center justify-center gap-1 bg-[#4a9eff] hover:bg-[#3b82f6] text-white px-2 py-1.5 rounded text-xs font-medium"><Check size={12} /> Save</button>
            <button onClick={cancel} className="flex-1 flex items-center justify-center gap-1 bg-white/10 hover:bg-white/20 text-white px-2 py-1.5 rounded text-xs font-medium"><X size={12} /> Cancel</button>
          </div>
        </div>
      ) : (
        <div className="px-3 py-2 border-t border-white/10">
          <p className="text-sm font-semibold text-white truncate">{item.name}</p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#4a9eff]">{item.price}</p>
            {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-[#4a9eff] transition-colors"><ExternalLink size={12} /></a>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── ArtStation Import Modal ────────────────────────────────────────
// Paste any ArtStation marketplace URL, fetch meta, download cover image, then save
function ArtStationImportModal({ onClose, onDone }: { onClose: () => void; onDone: () => Promise<void> }) {
  const [url, setUrl] = useState('');
  const [fetching, setFetching] = useState(false);
  const [scraped, setScraped] = useState<{ name: string; price: string; description: string; filename: string; } | null>(null);
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const scrape = async () => {
    setFetching(true); setError(''); setScraped(null);
    try {
      const res = await fetch('/api/scrape-artstation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setScraped(data);
      setName(data.name || '');
      setPrice(data.price || '');
    } catch (e: any) { setError(e.message); }
    setFetching(false);
  };

  const save = async () => {
    if (!scraped) return;
    setSaving(true);
    await fetch('/api/shop-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: scraped.filename, name, alt: scraped.description, category, price, link: url }),
    });
    await onDone();
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2"><LinkIcon size={18} className="text-[#4a9eff]" /> Import from URL</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X size={20} /></button>
        </div>

        {/* URL input */}
        <div className="flex gap-2 mb-4">
          <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && scrape()}
            placeholder="https://www.artstation.com/marketplace/p/..."
            className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4a9eff]" />
          <button onClick={scrape} disabled={!url || fetching}
            className="px-4 py-2 bg-[#4a9eff] hover:bg-[#3b82f6] disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2">
            {fetching ? <Loader2 size={14} className="animate-spin" /> : null}
            {fetching ? 'Fetching…' : 'Fetch'}
          </button>
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {scraped && (
          <div className="space-y-3">
            {/* Preview image */}
            {scraped.filename && (
              <img src={`/assets/shop/${scraped.filename}`} alt="preview"
                className="w-full max-h-44 object-contain rounded-lg bg-black/30" />
            )}
            <div>
              <label className="text-xs text-white/50 block mb-1">Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4a9eff]" />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-white/50 block mb-1">Price</label>
                <input value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4a9eff]" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-white/50 block mb-1">Category</label>
                <input value={category} onChange={e => setCategory(e.target.value.toUpperCase())}
                  list="shop-cats"
                  placeholder="e.g. GAMES"
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4a9eff]" />
                <datalist id="shop-cats">{PREDEFINED_CATEGORIES.map(c => <option key={c} value={c} />)}</datalist>
              </div>
            </div>
            <button onClick={save} disabled={saving || !scraped.filename}
              className="w-full flex items-center justify-center gap-2 bg-[#4a9eff] hover:bg-[#3b82f6] disabled:opacity-50 text-white py-2.5 rounded-lg font-medium transition-all">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {saving ? 'Saving…' : 'Add to Shop'}
            </button>
            {!scraped.filename && <p className="text-yellow-400 text-xs text-center">Image could not be downloaded. Check console for details.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Admin Panel ────────────────────────────────────────────────────────────
export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'hero' | 'gallery' | 'team' | 'shop'>('hero');

  // Hero state
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [heroUploading, setHeroUploading] = useState(false);
  const heroFileRef = useRef<HTMLInputElement>(null);

  // Gallery state
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  // Team state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showTeamModal, setShowTeamModal] = useState(false);

  // Shop state
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [showShopModal, setShowShopModal] = useState(false);

  useEffect(() => { document.title = 'Admin Panel | DCS'; }, []);
  useEffect(() => { fetchHero(); fetchGallery(); fetchTeam(); fetchShop(); }, []);

  const fetchHero = () => fetch('/api/hero-images').then(r => r.json()).then(d => Array.isArray(d) && setHeroImages(d));
  const fetchGallery = () => fetch('/api/gallery-images').then(r => r.json()).then(d => Array.isArray(d) && setGalleryImages(d));
  const fetchTeam = () => fetch('/api/team-members').then(r => r.json()).then(d => Array.isArray(d) && setTeamMembers(d));
  const fetchShop = () => fetch('/api/shop-items').then(r => r.json()).then(d => Array.isArray(d) && setShopItems(d));

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

  const handleTeamDelete = async (filename: string) => {
    if (!confirm('Delete this member?')) return;
    await fetch(`/api/team-members?file=${encodeURIComponent(filename)}`, { method: 'DELETE' });
    fetchTeam();
  };

  const handleTeamUpdate = async (filename: string, name: string, role: string, order: number) => {
    await fetch('/api/team-members', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename, name, role, order }) });
    fetchTeam();
  };

  const handleShopDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    await fetch(`/api/shop-items?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    fetchShop();
  };

  const handleShopUpdate = async (id: string, updates: Partial<ShopItem>) => {
    await fetch('/api/shop-items', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...updates }) });
    fetchShop();
  };

  return (
    <div className="min-h-screen bg-dark text-white">
      {showGalleryModal && <GalleryUploadModal onClose={() => setShowGalleryModal(false)} onDone={fetchGallery} />}
      {showTeamModal && <TeamUploadModal onClose={() => setShowTeamModal(false)} onDone={fetchTeam} />}
      {showShopModal && <ArtStationImportModal onClose={() => setShowShopModal(false)} onDone={fetchShop} />}

      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-dark/95 backdrop-blur border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold font-['Graduate',_sans-serif]">Admin Dashboard</h1>
        <Link to="/" className="text-sm text-[#4a9eff] hover:text-white transition-colors">← Back to Site</Link>
      </div>

      <div className="pt-20 max-w-6xl mx-auto px-4 pb-16">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white/5 rounded-xl p-1.5 w-fit">
          {([['hero', '🎠 Hero Carousel'], ['gallery', '🖼️ Gallery'], ['team', '👥 Team'], ['shop', '🛒 Shop']] as const).map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? 'bg-[#4a9eff] text-white shadow' : 'text-white/50 hover:text-white'}`}>
              {label}
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

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="bg-[#1a1f2e] border border-white/10 rounded-xl p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold mb-1">Team Members</h2>
                <p className="text-[#a0aec0] text-sm">Displayed on the About Us section. Use the order field to control position.</p>
              </div>
              <button onClick={() => setShowTeamModal(true)}
                className="flex items-center gap-2 bg-[#4a9eff] hover:bg-[#3b82f6] text-white px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap">
                <Upload size={16} /> Add Member
              </button>
            </div>

            {teamMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 border border-white/10 border-dashed rounded-lg bg-white/5 gap-3">
                <ImageIcon size={40} className="text-white/20" />
                <p className="text-[#a0aec0]">No team members yet. Add some to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {teamMembers.map(member => (
                  <TeamCard key={member.filename} member={member} onDelete={handleTeamDelete} onUpdate={handleTeamUpdate} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Shop Tab */}
        {activeTab === 'shop' && (
          <div className="bg-[#1a1f2e] border border-white/10 rounded-xl p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold mb-1">Shop Items</h2>
                <p className="text-[#a0aec0] text-sm">Import from an ArtStation marketplace URL or add manually. Hover a card to edit or delete.</p>
              </div>
              <button onClick={() => setShowShopModal(true)}
                className="flex items-center gap-2 bg-[#4a9eff] hover:bg-[#3b82f6] text-white px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap">
                <LinkIcon size={16} /> Import from URL
              </button>
            </div>

            {shopItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 border border-white/10 border-dashed rounded-lg bg-white/5 gap-3">
                <ImageIcon size={40} className="text-white/20" />
                <p className="text-[#a0aec0]">No shop items yet. Import from ArtStation to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {shopItems.map(item => (
                  <ShopCard key={item.id} item={item} onDelete={handleShopDelete} onUpdate={handleShopUpdate} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
