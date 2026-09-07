import React, { useState } from 'react';
import { Candidate, ParsedResume } from '../types';
import { api } from '../services/api';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Briefcase, 
  GraduationCap, 
  Layers,
  User,
  Eye
} from 'lucide-react';

interface ResumeParserTabProps {
  candidate: Candidate;
  onRefreshCandidate: () => void;
  onLogEvent: (stage: string, message: string, status: 'Running' | 'Success' | 'Failed') => void;
}

export const ResumeParserTab: React.FC<ResumeParserTabProps> = ({
  candidate,
  onRefreshCandidate,
  onLogEvent
}) => {
  const [resumeText, setResumeText] = useState(candidate.raw_resume || '');
  const [parsedData, setParsedData] = useState<ParsedResume | null>(candidate.parsed_data || null);
  const [loading, setLoading] = useState(false);
  const [showRawText, setShowRawText] = useState(false);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    setResumeText(candidate.raw_resume || '');
    setParsedData(candidate.parsed_data || null);
  }, [candidate]);

  const handleExtractProfile = async () => {
    if (!resumeText.trim()) return;
    setLoading(true);
    onLogEvent('ProfileExtraction', `Analyzing resume for ${candidate.name}...`, 'Running');

    try {
      const res = await api.parseResume(candidate.id, resumeText);
      setParsedData(res.data);
      onLogEvent('ProfileExtraction', `Successfully extracted structured profile for ${res.data.name}`, 'Success');
      onRefreshCandidate();
    } catch (err: any) {
      onLogEvent('ProfileExtraction', `Extraction error: ${err.message}`, 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyProfile = () => {
    if (!parsedData) return;
    navigator.clipboard.writeText(JSON.stringify(parsedData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    onLogEvent('ProfileExtraction', `Uploading & parsing document (${file.name})...`, 'Running');

    try {
      const res = await api.uploadResumeDirect(candidate.id, file);
      setResumeText(res.raw_text);
      setParsedData(res.data);
      onLogEvent('ProfileExtraction', `Successfully extracted structured profile from ${file.name}`, 'Success');
      onRefreshCandidate();
    } catch (err: any) {
      onLogEvent('ProfileExtraction', `Document upload failed: ${err.message}`, 'Failed');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>Candidate Profile & Smart Extraction</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated extraction of candidate qualifications, work history, tech stack, and educational background.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.docx,.doc,.txt"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingFile}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{uploadingFile ? 'Uploading Document...' : 'Upload PDF / Word'}</span>
          </button>
          <button
            onClick={() => setShowRawText(!showRawText)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center space-x-1.5 border border-slate-700"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showRawText ? 'Show Formatted Profile' : 'Show Raw Text'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Resume Input, Right Extracted Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Resume Input */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200">Candidate Resume Document</span>
            <span className="text-[10px] text-slate-400 font-medium">Text / PDF / Word Document</span>
          </div>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste candidate resume text or click 'Upload PDF / Word' above..."
            className="w-full flex-1 min-h-[380px] bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
          />
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400">Target Candidate: <strong className="text-slate-200">{candidate.name}</strong></span>
            <button
              onClick={handleExtractProfile}
              disabled={loading || !resumeText.trim()}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center space-x-2 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{loading ? 'Analyzing Profile...' : 'Extract Candidate Profile'}</span>
            </button>
          </div>
        </div>

        {/* Right: Parsed Profile Output */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200">Extracted Candidate Profile</span>
            {parsedData && (
              <button
                onClick={handleCopyProfile}
                className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Summary'}</span>
              </button>
            )}
          </div>

          {!parsedData ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500">
              <FileText className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-xs font-medium">No candidate profile extracted yet.</p>
              <p className="text-[11px] text-slate-600 mt-1">Click "Extract Candidate Profile" to analyze candidate information.</p>
            </div>
          ) : showRawText ? (
            <div className="flex-1 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 overflow-y-auto max-h-[420px] whitespace-pre-wrap leading-relaxed">
              {resumeText}
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto max-h-[440px] pr-1">
              {/* Profile Summary Card */}
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white">{parsedData.name}</h4>
                  <span className="text-[10px] text-slate-400 font-medium">{parsedData.location || 'Location Not Specified'}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{parsedData.summary}</p>
                <div className="text-[11px] text-slate-400 flex items-center space-x-3 pt-1">
                  <span>✉ {parsedData.email || 'N/A'}</span>
                  <span>☎ {parsedData.phone || 'N/A'}</span>
                </div>
              </div>

              {/* Skills Grid */}
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Identified Skills & Expertise</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {parsedData.skills?.map((s, idx) => (
                    <span key={idx} className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                      {s}
                    </span>
                  ))}
                  {parsedData.programming_languages?.map((p, idx) => (
                    <span key={`pl-${idx}`} className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium">
                      {p}
                    </span>
                  ))}
                  {parsedData.frameworks?.map((f, idx) => (
                    <span key={`fw-${idx}`} className="text-[11px] px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience Highlights */}
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Professional Work History</span>
                </div>
                <div className="space-y-2">
                  {parsedData.experience?.map((exp, idx) => (
                    <div key={idx} className="border-l-2 border-indigo-500/40 pl-3 py-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                        <span>{exp.title} • <span className="text-indigo-300">{exp.company}</span></span>
                        <span className="text-[10px] text-slate-400">{exp.duration}</span>
                      </div>
                      <ul className="text-[11px] text-slate-400 list-disc list-inside mt-1 space-y-0.5">
                        {exp.responsibilities?.slice(0, 2).map((r, rIdx) => (
                          <li key={rIdx}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              {parsedData.education && parsedData.education.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-1.5">
                  <div className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Education Background</span>
                  </div>
                  {parsedData.education.map((edu, idx) => (
                    <div key={idx} className="text-xs text-slate-300">
                      <strong>{edu.degree}</strong> — {edu.institution} ({edu.graduation_year || 'N/A'})
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
