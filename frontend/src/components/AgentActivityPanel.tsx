import React from 'react';
import { Activity, X, Sparkles, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface AgentEvent {
  id: string;
  stage: string;
  message: string;
  status: 'Running' | 'Success' | 'Failed' | 'Warning';
  timestamp: string;
}

interface AgentActivityPanelProps {
  isOpen: boolean;
  onClose: () => void;
  events: AgentEvent[];
  onClear: () => void;
}

export const AgentActivityPanel: React.FC<AgentActivityPanelProps> = ({
  isOpen,
  onClose,
  events,
  onClear
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-slate-900/95 border-l border-slate-800 shadow-2xl backdrop-blur-xl z-50 flex flex-col transition-all">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          <h3 className="font-bold text-xs text-slate-100 uppercase tracking-wider">Assessment Activity Log</h3>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onClear}
            className="text-[10px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700"
          >
            Clear
          </button>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="p-4 flex-1 overflow-y-auto space-y-3 text-xs">
        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
            <Activity className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-xs">No active pipeline events yet.</p>
            <p className="text-[11px] text-slate-600">Run an evaluation round to view real-time assessment logs.</p>
          </div>
        ) : (
          events.map((ev) => (
            <div
              key={ev.id}
              className={`p-3 rounded-xl border transition-all ${
                ev.status === 'Success'
                  ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                  : ev.status === 'Running'
                  ? 'bg-indigo-950/30 border-indigo-800/40 text-indigo-300 animate-pulse-subtle'
                  : ev.status === 'Failed'
                  ? 'bg-rose-950/30 border-rose-800/40 text-rose-300'
                  : 'bg-slate-850 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] mb-1 font-semibold text-slate-400">
                <span className="flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-indigo-400 inline mr-1" />
                  <span>{ev.stage}</span>
                </span>
                <span className="text-slate-500">{ev.timestamp}</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-200">{ev.message}</p>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800 text-[10px] text-slate-500 text-center">
        Real-Time Assessment Pipeline Activity Stream
      </div>
    </div>
  );
};
