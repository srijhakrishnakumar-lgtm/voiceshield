import React, { useState, useEffect } from 'react';
import { Play, Upload, CheckCircle2, AlertTriangle, FileAudio, RefreshCw } from 'lucide-react';

const PRESET_SAMPLES = [
  // Default Demo Pair First!
  { id: 'gen_spk1_en', name: 'Speaker 01 (English) — GENUINE [DEFAULT DEMO]', folder: 'genuine', filename: 'speaker01_en_01.wav', label: 'GENUINE' },
  { id: 'clone_spk1_en', name: 'Speaker 01 (English) — CLONED [DEFAULT DEMO]', folder: 'cloned', filename: 'speaker01_en_01.wav', label: 'CLONED' },
  
  // Other Samples
  { id: 'gen_spk1_ta', name: 'Speaker 01 (Tamil) — GENUINE', folder: 'genuine', filename: 'speaker01_ta_02.wav', label: 'GENUINE' },
  { id: 'gen_spk2_hi1', name: 'Speaker 02 (Hindi Clip 1) — GENUINE', folder: 'genuine', filename: 'speaker02_hi_01.wav', label: 'GENUINE' },
  { id: 'gen_spk2_hi2', name: 'Speaker 02 (Hindi Clip 2) — GENUINE', folder: 'genuine', filename: 'speaker02_hi_02.wav', label: 'GENUINE' },
  { id: 'gen_spk3_en', name: 'Speaker 03 (English) — GENUINE', folder: 'genuine', filename: 'speaker03_en_02.wav', label: 'GENUINE' },
  { id: 'gen_spk3_ta', name: 'Speaker 03 (Tamil) — GENUINE', folder: 'genuine', filename: 'speaker03_ta_01.wav', label: 'GENUINE' },
  
  { id: 'clone_spk1_hi', name: 'Speaker 01 (Hindi) — CLONED', folder: 'cloned', filename: 'speaker01_hi_01.wav', label: 'CLONED' },
  { id: 'clone_spk1_ta', name: 'Speaker 01 (Tamil) — CLONED', folder: 'cloned', filename: 'speaker01_ta_01.wav', label: 'CLONED' },
  { id: 'clone_spk2_en', name: 'Speaker 02 (English) — CLONED', folder: 'cloned', filename: 'speaker02_en_02.wav', label: 'CLONED' },
  { id: 'clone_spk2_hi', name: 'Speaker 02 (Hindi) — CLONED', folder: 'cloned', filename: 'speaker02_hi_02.wav', label: 'CLONED' },
  { id: 'clone_spk2_ta', name: 'Speaker 02 (Tamil) — CLONED [EDGE CASE]', folder: 'cloned', filename: 'speaker02_ta_02_.wav', label: 'CLONED' },
];

export default function IngestControl({ onAnalysisComplete, isLoading, setIsLoading }) {
  const [selectedSample, setSelectedSample] = useState(PRESET_SAMPLES[0]);
  const [customFile, setCustomFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState('/samples/genuine/speaker01_en_01.wav');
  const [activeTab, setActiveTab] = useState('preset'); // 'preset' | 'upload'
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (activeTab === 'preset' && selectedSample) {
      setAudioUrl(`/samples/${selectedSample.folder}/${selectedSample.filename}`);
      setCustomFile(null);
    }
  }, [selectedSample, activeTab]);

  const handleCustomFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCustomFile(file);
      setAudioUrl(URL.createObjectURL(file));
      setErrorMsg(null);
    }
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      let audioBlob;
      let filename;

      if (activeTab === 'upload' && customFile) {
        audioBlob = customFile;
        filename = customFile.name;
      } else {
        const fetchUrl = `/samples/${selectedSample.folder}/${selectedSample.filename}`;
        const response = await fetch(fetchUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch audio file from ${fetchUrl}`);
        }
        audioBlob = await response.blob();
        filename = selectedSample.filename;
      }

      const formData = new FormData();
      formData.append('file', audioBlob, filename);
      formData.append('session_id', 'demo-session');
      formData.append('chunk_index', 1);

      const apiRes = await fetch('/api/analyze-audio-chunk', {
        method: 'POST',
        body: formData,
      });

      if (!apiRes.ok) {
        throw new Error(`Server returned HTTP ${apiRes.status}`);
      }

      const result = await apiRes.json();
      onAnalysisComplete(result);
    } catch (err) {
      console.error('Analysis error:', err);
      setErrorMsg(err.message || 'Failed to analyze audio chunk');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <FileAudio className="w-4 h-4 text-cyan-400" />
          Ingest Stream Control
        </h3>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
          DEMO MODE
        </span>
      </div>

      {/* Mode Switch Tabs */}
      <div className="grid grid-cols-2 p-1 bg-slate-900/80 rounded-lg border border-slate-800/80 text-xs font-mono">
        <button
          onClick={() => setActiveTab('preset')}
          className={`py-2 rounded-md transition-all font-medium ${
            activeTab === 'preset'
              ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-500/40 cyber-glow-cyan'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Preset Sample Clips
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`py-2 rounded-md transition-all font-medium ${
            activeTab === 'upload'
              ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-500/40 cyber-glow-cyan'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Upload Custom WAV
        </button>
      </div>

      {/* Preset Selector */}
      {activeTab === 'preset' ? (
        <div className="space-y-3">
          <label className="text-xs font-mono text-slate-400 block">
            Select Test Audio Sample:
          </label>
          <select
            value={selectedSample.id}
            onChange={(e) => {
              const sample = PRESET_SAMPLES.find((s) => s.id === e.target.value);
              if (sample) setSelectedSample(sample);
            }}
            className="w-full bg-slate-900 text-slate-200 text-xs font-mono p-3 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500/60"
          >
            <optgroup label="✨ Default Demo Pair">
              {PRESET_SAMPLES.slice(0, 2).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Genuine Voice Clips">
              {PRESET_SAMPLES.filter((s) => s.label === 'GENUINE' && !s.name.includes('DEFAULT')).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="AI Cloned Voice Clips">
              {PRESET_SAMPLES.filter((s) => s.label === 'CLONED' && !s.name.includes('DEFAULT')).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </optgroup>
          </select>

          {/* Sample Label Badge */}
          <div className="flex items-center justify-between text-xs font-mono pt-1">
            <span className="text-slate-400">Expected Class:</span>
            <span
              className={`px-2.5 py-1 rounded text-[11px] font-bold border ${
                selectedSample.label === 'GENUINE'
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                  : 'bg-rose-950/60 text-rose-400 border-rose-500/40'
              }`}
            >
              {selectedSample.label === 'GENUINE' ? '✓ EXPECTED NATURAL' : '⚠ EXPECTED SYNTHETIC'}
            </span>
          </div>
        </div>
      ) : (
        /* File Upload Box */
        <div className="space-y-3">
          <label className="text-xs font-mono text-slate-400 block">
            Upload Audio File (.wav, .mp3, .flac):
          </label>
          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-xl bg-slate-900/50 cursor-pointer transition-all">
            <Upload className="w-8 h-8 text-cyan-400 mb-2" />
            <span className="text-xs font-mono text-slate-300">
              {customFile ? customFile.name : 'Click to select or drag audio clip here'}
            </span>
            <span className="text-[10px] font-mono text-slate-500 mt-1">
              Supports 16kHz WAV mono audio
            </span>
            <input
              type="file"
              accept="audio/*"
              onChange={handleCustomFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Audio Player Preview */}
      {audioUrl && (
        <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Audio Playback Preview:
          </span>
          <audio controls src={audioUrl} className="w-full h-8" />
        </div>
      )}

      {/* Error Message Display */}
      {errorMsg && (
        <div className="p-3 bg-rose-950/60 border border-rose-500/50 rounded-lg text-rose-400 text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Execute Analysis Action Button */}
      <button
        onClick={handleAnalyze}
        disabled={isLoading}
        className="w-full py-3.5 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cyber-glow-cyan"
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
            <span>Analyzing Voice Stream...</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Analyze Voice Stream</span>
          </>
        )}
      </button>
    </div>
  );
}
