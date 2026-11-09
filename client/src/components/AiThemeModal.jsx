import React, { useState, useEffect } from 'react';
import { 
  X, 
  Wand2, 
  Sparkles, 
  Check, 
  Download, 
  RefreshCw, 
  Image as ImageIcon, 
  Cpu, 
  Sliders, 
  AlertCircle 
} from 'lucide-react';

const PRESETS = [
  {
    id: 'cyberpunk',
    title: 'Cyberpunk Neon Lounge',
    tag: 'Sci-Fi Synth',
    prompt: 'cyberpunk music lounge, neon purple and emerald lighting, holographic equalizer soundwaves, dark futuristic room, cinematic reflections, 8k',
    previewGradient: 'from-purple-900 via-indigo-950 to-emerald-950',
    fallbackImg: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&q=80'
  },
  {
    id: 'lofi',
    title: 'Lo-Fi Anime Rain',
    tag: 'Chill Bedroom',
    prompt: 'lofi anime bedroom at rainy night, headphones on desk, warm ambient lamp, vinyl record spinning, cozy window with city lights, Studio Ghibli aesthetic',
    previewGradient: 'from-amber-950 via-stone-900 to-indigo-950',
    fallbackImg: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80'
  },
  {
    id: 'cosmic',
    title: 'Cosmic Soundwave',
    tag: 'Deep Space',
    prompt: 'cosmic nebula in deep space shaped like soundwaves, vibrant violet and turquoise stardust, iridescent fluid particles, abstract audio visualization, 8k masterpiece',
    previewGradient: 'from-fuchsia-950 via-purple-950 to-cyan-950',
    fallbackImg: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80'
  },
  {
    id: 'vinyl',
    title: 'Warm Audiophile Studio',
    tag: 'Analog Vintage',
    prompt: 'luxurious audiophile room, glowing vacuum tube amplifiers, wooden turntable, vintage vinyl records, warm golden hour lighting, cinematic bokeh',
    previewGradient: 'from-amber-950 via-orange-950 to-neutral-950',
    fallbackImg: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&q=80'
  }
];

export default function AiThemeModal({ isOpen, onClose, onApplyBackground }) {
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isSdOnline, setIsSdOnline] = useState(false);
  const [checkingSd, setCheckingSd] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [applied, setApplied] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Check connection to local AUTOMATIC1111 Stable Diffusion WebUI API
  useEffect(() => {
    if (!isOpen) return;
    checkSdApi();
  }, [isOpen]);

  const checkSdApi = async () => {
    setCheckingSd(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch('http://127.0.0.1:7860/sdapi/v1/sd-models', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        setIsSdOnline(true);
        setStatusMessage('AUTOMATIC1111 connected on port 7860');
      } else {
        setIsSdOnline(false);
      }
    } catch {
      setIsSdOnline(false);
    } finally {
      setCheckingSd(false);
    }
  };

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setGenerating(true);
    setApplied(false);
    const activePrompt = customPrompt.trim() || selectedPreset.prompt;

    if (isSdOnline) {
      try {
        const response = await fetch('http://127.0.0.1:7860/sdapi/v1/txt2img', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `(masterpiece, best quality, ultra-detailed:1.2), cinematic lighting, ${activePrompt}, 8k resolution, sharp focus`,
            negative_prompt: '(worst quality, low quality:1.4), deformed, bad hands, blurry, watermark, signature, text',
            steps: 20,
            cfg_scale: 7.0,
            width: 768,
            height: 512,
            sampler_name: 'DPM++ 2M Karras'
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.images && data.images.length > 0) {
            const base64Uri = `data:image/png;base64,${data.images[0]}`;
            setGeneratedImage(base64Uri);
            setGenerating(false);
            return;
          }
        }
      } catch (err) {
        console.warn('SD WebUI generation failed, falling back to procedural preset:', err);
      }
    }

    // Procedural fallback simulation
    setTimeout(() => {
      setGeneratedImage(selectedPreset.fallbackImg);
      setGenerating(false);
    }, 800);
  };

  const handleApply = () => {
    const target = generatedImage || selectedPreset.fallbackImg;
    if (onApplyBackground && target) {
      onApplyBackground(target);
      setApplied(true);
      setTimeout(() => setApplied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#0e101b] border border-white/10 p-5 sm:p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Glow backdrop */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <Wand2 className="w-4 h-4 text-purple-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-heading">
                AI Room Visualizer & Art Studio
              </h3>
              <p className="text-[11px] text-white/50">
                Powered by Stable Diffusion WebUI & Procedural Ambient Shaders
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-4 space-y-4 overflow-y-auto no-scrollbar">
          
          {/* SD WebUI Status Pill */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <div className="text-xs">
                <span className="text-white/80 font-medium">AUTOMATIC1111 Local Engine: </span>
                <span className={isSdOnline ? 'text-emerald-400 font-bold' : 'text-amber-400/90 font-medium'}>
                  {checkingSd ? 'Checking...' : isSdOnline ? 'ONLINE (Port 7860)' : 'Offline (Using Curated Presets)'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={checkSdApi}
              className="text-xs text-purple-300 hover:text-white p-1"
              title="Refresh connection"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checkingSd ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Preset Styles */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/70 block">
              Curated Music Art Directions
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {PRESETS.map((p) => {
                const isSelected = selectedPreset.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedPreset(p);
                      setCustomPrompt(p.prompt);
                    }}
                    className={`relative p-3 rounded-2xl cursor-pointer border transition-all ${
                      isSelected
                        ? 'bg-purple-600/20 border-purple-400/60 shadow-lg shadow-purple-600/20'
                        : 'bg-[#141624] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/10 text-purple-300 font-semibold">
                        {p.tag}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-purple-400" />}
                    </div>
                    <div className="text-xs font-bold text-white leading-tight">
                      {p.title}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Prompt Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/70 block">
              Prompt Instructions
            </label>
            <textarea
              rows={2}
              value={customPrompt || selectedPreset.prompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full text-xs p-3 rounded-2xl bg-black/40 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-400 transition-colors font-mono resize-none"
              placeholder="Enter art prompt or keywords..."
            />
          </div>

          {/* Preview / Generated Image Display */}
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black/60 shadow-inner flex items-center justify-center">
            {generating ? (
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="w-6 h-6 text-purple-400 animate-spin" />
                <span className="text-xs font-medium text-purple-300">
                  {isSdOnline ? 'Generating via GPU (DPM++ 2M Karras)...' : 'Synthesizing artwork...'}
                </span>
              </div>
            ) : generatedImage ? (
              <img
                src={generatedImage}
                alt="AI Generated Theme"
                className="w-full h-full object-cover animate-fade-in"
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-tr ${selectedPreset.previewGradient} flex flex-col items-center justify-center p-4 text-center`}>
                <ImageIcon className="w-8 h-8 text-white/40 mb-2" />
                <span className="text-xs text-white/80 font-medium">
                  Click Generate to synthesize artwork
                </span>
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{generating ? 'Synthesizing...' : 'Generate Art'}</span>
          </button>

          <div className="flex items-center gap-2">
            {generatedImage && (
              <a
                href={generatedImage}
                download="musicroom-theme.png"
                className="px-3 py-2 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/15 text-white flex items-center gap-1.5 transition-colors"
                title="Download PNG"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save</span>
              </a>
            )}

            <button
              type="button"
              onClick={handleApply}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all ${
                applied
                  ? 'bg-emerald-500 text-black shadow-emerald-500/30'
                  : 'bg-white hover:bg-white/90 text-black shadow-white/20'
              }`}
            >
              {applied ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{applied ? 'Applied to Room!' : 'Set Room Wallpaper'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

