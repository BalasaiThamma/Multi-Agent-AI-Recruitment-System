import React, { useState, useRef } from 'react';
import { Candidate, ScreeningAnalysisResult } from '../types';
import { api } from '../services/api';
import { 
  Mic2, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Volume2, 
  FileText, 
  Activity, 
  Clock, 
  ShieldAlert,
  Layers,
  MessageSquare,
  UploadCloud,
  FileAudio,
  Play
} from 'lucide-react';

interface ScreeningTabProps {
  candidate: Candidate;
  activeProvider: string;
  onRefreshCandidate: () => void;
  onLogEvent: (stage: string, message: string, status: 'Running' | 'Success' | 'Failed') => void;
}

export const ScreeningTab: React.FC<ScreeningTabProps> = ({
  candidate,
  activeProvider,
  onRefreshCandidate,
  onLogEvent,
}) => {
  const [screeningResult, setScreeningResult] = useState<ScreeningAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [uploadedAudioName, setUploadedAudioName] = useState<string | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  const handleRunScreening = async () => {
    setLoading(true);
    onLogEvent('ScreeningAgent', `Starting Whisper speech-to-text conversion & STAR analysis for ${candidate.name}...`, 'Running');

    try {
      const res = await api.analyzeScreening(candidate.id, activeProvider);
      setScreeningResult(res.data);
      onLogEvent('ScreeningAgent', `Completed Speech-to-Text & STAR evaluation: ${res.data.overall_screening_score}/100`, 'Success');
      onRefreshCandidate();
    } catch (err: any) {
      onLogEvent('ScreeningAgent', `Screening analysis error: ${err.message}`, 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAudioFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedAudioName(file.name);
    setLoading(true);
    onLogEvent('ScreeningAgent', `Transcribing uploaded audio file (${file.name}) using Whisper...`, 'Running');

    try {
      const res = await api.uploadScreeningAudio(file, candidate.id, activeProvider);
      setScreeningResult(res.data);
      onLogEvent('ScreeningAgent', `Whisper transcription complete: ${res.data.overall_screening_score}/100`, 'Success');
      onRefreshCandidate();
    } catch (err: any) {
      onLogEvent('ScreeningAgent', `Audio upload error: ${err.message}`, 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Mic2 className="w-5 h-5 text-indigo-400" />
            <span>Virtual Screening & Speech-to-Text Analysis Agent</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Whisper converts spoken audio into text with timestamped segments and evaluates candidate answers using the STAR behavioral framework.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm"
            onChange={handleUploadAudioFile}
            className="hidden"
          />

          <button
            onClick={() => audioInputRef.current?.click()}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-2 transition-all"
          >
            <UploadCloud className="w-4 h-4 text-indigo-400" />
            <span>{uploadedAudioName ? `Audio: ${uploadedAudioName}` : 'Upload Audio File'}</span>
          </button>

          <button
            onClick={handleRunScreening}
            disabled={loading}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center space-x-2 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loading ? 'Whisper Transcribing...' : 'Run Audio Screening Agent'}</span>
          </button>
        </div>
      </div>

      {/* Audio Engine Status Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-md">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">
              {uploadedAudioName ? `Active Audio: ${uploadedAudioName}` : 'Candidate Technical Interview Audio Stream'}
            </div>
            <div className="text-[11px] text-slate-400">Speech-to-Text (STT) Engine: OpenAI Whisper Architecture</div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold font-mono">
            Whisper ASR Active
          </span>
        </div>
      </div>

      {/* Main Results View */}
      {!screeningResult ? (
        <div className="p-12 rounded-2xl glass-panel border border-slate-800 flex flex-col items-center justify-center text-center text-slate-500">
          <Mic2 className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-xs font-medium">No audio screening analysis generated yet.</p>
          <p className="text-[11px] text-slate-600 mt-1">Click "Run Audio Screening Agent" to transcribe and evaluate the interview recording.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Score Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Overall Screening Score</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">{screeningResult.overall_screening_score}/100</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Communication Clarity</span>
              <div className="text-2xl font-black text-indigo-300 mt-1">{screeningResult.communication_metrics.clarity_score}%</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Protocol Adherence</span>
              <div className="text-2xl font-black text-blue-400 mt-1">{screeningResult.protocol_compliance_score}%</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Speech Pace</span>
              <div className="text-2xl font-black text-slate-200 mt-1">{screeningResult.communication_metrics.speech_pace_wpm} WPM</div>
            </div>
          </div>

          {/* STAR Framework Cards (4 Column Grid) */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              STAR Framework Behavioral Deconstruction
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Situation */}
              <div className="p-4 rounded-xl bg-slate-900 border border-blue-900/30 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-blue-400">
                  <span className="w-5 h-5 rounded-md bg-blue-500/20 flex items-center justify-center">S</span>
                  <span>Situation (Context)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {screeningResult.star_analysis[0]?.situation}
                </p>
              </div>

              {/* Task */}
              <div className="p-4 rounded-xl bg-slate-900 border border-purple-900/30 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-purple-400">
                  <span className="w-5 h-5 rounded-md bg-purple-500/20 flex items-center justify-center">T</span>
                  <span>Task (Goal)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {screeningResult.star_analysis[0]?.task}
                </p>
              </div>

              {/* Action */}
              <div className="p-4 rounded-xl bg-slate-900 border border-amber-900/30 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-amber-400">
                  <span className="w-5 h-5 rounded-md bg-amber-500/20 flex items-center justify-center">A</span>
                  <span>Action (Engineering)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {screeningResult.star_analysis[0]?.action}
                </p>
              </div>

              {/* Result */}
              <div className="p-4 rounded-xl bg-slate-900 border border-emerald-900/30 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
                  <span className="w-5 h-5 rounded-md bg-emerald-500/20 flex items-center justify-center">R</span>
                  <span>Result (Impact)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {screeningResult.star_analysis[0]?.result}
                </p>
              </div>
            </div>
          </div>

          {/* Transcript & Protocol Compliance Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timestamped Transcript */}
            <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Whisper Timestamped Transcript</span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">
                  {Math.round(screeningResult.transcription_confidence * 100)}% Confidence
                </span>
              </div>
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {screeningResult.timestamped_segments.map((seg, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-850 border border-slate-800 text-xs flex space-x-3">
                    <span className="text-[10px] font-mono text-indigo-400 shrink-0">{seg.start}s - {seg.end}s</span>
                    <p className="text-slate-300 leading-relaxed">{seg.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Assessment Protocol Checklist */}
            <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Interview Protocol Adherence</span>
                <span className="text-[10px] text-slate-400 font-mono">4 Core Questions</span>
              </div>
              <div className="space-y-2">
                {screeningResult.protocol_compliance.map((q) => (
                  <div key={q.question_number} className="p-3 rounded-xl bg-slate-850 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-slate-200">{q.question_number}. {q.question_text}</span>
                      {q.is_answered ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                      )}
                    </div>
                    {q.candidate_answer_summary && (
                      <p className="text-[11px] text-slate-400 pl-4">{q.candidate_answer_summary}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
