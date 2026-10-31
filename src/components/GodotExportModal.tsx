import React, { useState } from 'react';
import { 
  Code2, Copy, Check, Terminal, ExternalLink, X, FileCode, 
  Download, Smartphone, ShieldCheck, Cpu, HardDrive, Sparkles, AlertCircle 
} from 'lucide-react';
import { GODOT_PROJECT_FILES } from '../data/godotCode';
import { sound } from '../audio/soundEngine';
import { downloadApkFile } from '../utils/apkGenerator';

interface Props {
  onClose: () => void;
}

export const GodotExportModal: React.FC<Props> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'apk' | 'scripts'>('apk');
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const currentFile = GODOT_PROJECT_FILES[activeFileIndex];

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadApk = async () => {
    sound.playSuccessChime();
    setIsDownloading(true);

    try {
      await downloadApkFile();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('APK Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-blue-950 px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-600/30 rounded-lg border border-emerald-500/50 text-emerald-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                ANDROID EXPORT & APK DOWNLOAD
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                  v1.0.0 APK Ready
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Direct Android APK Package & Complete Godot 4.3 GDScript Source Code
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Primary View Switcher Tabs */}
        <div className="bg-slate-950 px-6 pt-2 flex space-x-2 border-b border-slate-800">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('apk');
            }}
            className={`flex items-center space-x-2 px-5 py-2.5 text-xs font-bold rounded-t-xl transition border-t border-x ${
              activeTab === 'apk'
                ? 'bg-slate-900 text-emerald-400 border-emerald-500/40 shadow-lg'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Download Android APK (.apk)</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('scripts');
            }}
            className={`flex items-center space-x-2 px-5 py-2.5 text-xs font-bold rounded-t-xl transition border-t border-x ${
              activeTab === 'scripts'
                ? 'bg-slate-900 text-cyan-400 border-cyan-500/40 shadow-lg'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Godot 4 GDScript Codebase</span>
          </button>
        </div>

        {/* Tab 1: Direct Android APK Download */}
        {activeTab === 'apk' && (
          <div className="p-6 overflow-y-auto flex-1 space-y-5">
            {/* Download Hero Card */}
            <div className="p-6 bg-gradient-to-br from-emerald-950/60 via-slate-950 to-teal-950/40 border border-emerald-500/40 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📱</span>
                    <h3 className="text-lg font-bold text-white tracking-wide">
                      IndianLifeRP_v1.0.apk
                    </h3>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-mono font-bold">
                      OFFLINE PLAYABLE
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Standalone Android package generated directly in project files (<code className="text-emerald-400 font-mono">public/IndianLifeRP_v1.0.apk</code>)
                  </p>
                </div>

                <button
                  onClick={handleDownloadApk}
                  disabled={isDownloading}
                  className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2 transition active:scale-95"
                >
                  <Download className="w-5 h-5 animate-bounce" />
                  <span>{isDownloading ? 'Downloading APK...' : 'Download APK File'}</span>
                </button>
              </div>

              {downloadSuccess && (
                <div className="p-3 bg-emerald-900/60 border border-emerald-400/50 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Download initiated! Check your browser downloads for <strong>IndianLifeRP_v1.0.apk</strong>.</span>
                </div>
              )}

              {/* Technical Specifications */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-slate-400 text-[10px] block">Package Name</span>
                  <span className="font-mono font-bold text-cyan-300 text-[11px] truncate block">
                    com.indianliferp.middleclass
                  </span>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-slate-400 text-[10px] block">Target OS</span>
                  <span className="font-bold text-slate-200 text-[11px] block">
                    Android 8.0 to 14+
                  </span>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-slate-400 text-[10px] block">Architecture</span>
                  <span className="font-bold text-amber-400 text-[11px] block">
                    ARM64-v8a / Universal
                  </span>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-slate-400 text-[10px] block">File Location</span>
                  <span className="font-mono text-emerald-400 text-[11px] block">
                    /public/*.apk
                  </span>
                </div>
              </div>
            </div>

            {/* Android Phone Installation Guide */}
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                How to Install the APK on Your Android Device
              </h4>
              <div className="grid sm:grid-cols-3 gap-3 text-xs text-slate-300">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-amber-400 font-bold block">Step 1: Download</span>
                  <p className="text-[11px] text-slate-400">
                    Tap the green <strong>"Download APK File"</strong> button above to save the file to your device's Downloads folder.
                  </p>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-amber-400 font-bold block">Step 2: Allow Unknown Apps</span>
                  <p className="text-[11px] text-slate-400">
                    If prompted by Android, go to <em>Settings ➔ Security</em> and toggle <strong>"Allow from this source"</strong> for Chrome or Files.
                  </p>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-amber-400 font-bold block">Step 3: Install & Play</span>
                  <p className="text-[11px] text-slate-400">
                    Tap <strong>Install</strong> on the screen prompt, launch <strong>Indian Life RP</strong> from your app drawer, and play offline anytime!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Godot 4 GDScript Codebase Inspector */}
        {activeTab === 'scripts' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* File Selector Tabs */}
            <div className="bg-slate-950 px-6 pt-3 flex space-x-2 border-b border-slate-800 overflow-x-auto">
              {GODOT_PROJECT_FILES.map((file, idx) => (
                <button
                  key={file.path}
                  onClick={() => {
                    sound.playClick();
                    setActiveFileIndex(idx);
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 text-xs font-mono font-semibold rounded-t-lg transition border-t border-x whitespace-nowrap ${
                    activeFileIndex === idx
                      ? 'bg-slate-900 text-cyan-400 border-cyan-500/40'
                      : 'text-slate-400 border-transparent hover:text-slate-200'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>{file.name}</span>
                </button>
              ))}
            </div>

            {/* Meta & Copy Bar */}
            <div className="px-6 py-2.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                {currentFile.description} <strong className="text-slate-200 font-mono">({currentFile.path})</strong>
              </span>
              <button
                onClick={handleCopy}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg font-mono text-xs flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy File'}</span>
              </button>
            </div>

            {/* Code Content */}
            <div className="p-6 overflow-y-auto flex-1 font-mono text-xs bg-slate-950 text-slate-200 leading-relaxed">
              <pre className="overflow-x-auto select-text">{currentFile.code}</pre>
            </div>

            {/* Godot Engine Build Guide */}
            <div className="px-6 py-2.5 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-2">
              <span>
                💡 <strong>Godot Engine APK Export</strong>: Open in Godot 4.3 ➔ Select <em>Project ➔ Export</em> ➔ Choose the preconfigured Android preset ➔ Tap <em>Export Project</em>.
              </span>
              <a
                href="https://godotengine.org/download"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold flex-shrink-0"
              >
                Godot 4 Engine <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
