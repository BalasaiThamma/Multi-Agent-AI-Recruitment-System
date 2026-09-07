import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Target, 
  Code2, 
  Mic2, 
  Scale, 
  FileCheck, 
  UserCheck2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  candidateStats?: {
    total: number;
    shortlisted: number;
    awaiting: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, candidateStats }) => {
  const navItems = [
    { id: 'dashboard', label: '1. Executive Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'resume', label: '2. Candidate Profile & Resume', icon: FileText, badge: null },
    { id: 'matching', label: '3. Role Competency Match', icon: Target, badge: null },
    { id: 'coding', label: '4. Candidate Coding Assessment', icon: Code2, badge: null },
    { id: 'screening', label: '5. Technical Screening', icon: Mic2, badge: null },
    { id: 'scoring', label: '6. Demographic-Blind Merit Scoring', icon: Scale, badge: 'Bias-Mitigated' },
    { id: 'report', label: '7. Candidate Dossier', icon: FileCheck, badge: null },
    { id: 'hr', label: '8. Shortlisting & Decisions', icon: UserCheck2, badge: candidateStats?.awaiting ? `${candidateStats.awaiting} pending` : null },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
      {/* Brand Logo */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-100 leading-tight">TalentMatrix AI</h1>
            <p className="text-xs text-indigo-400 font-medium">Enterprise Recruitment</p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Assessment Stages
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-slate-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : item.badge.includes('pending')
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Trust & Governance Banner */}
      <div className="p-4 m-3 rounded-xl bg-slate-850 border border-slate-800/80">
        <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Fairness & Governance</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Demographic-blinded evaluation. AI recommendations are advisory; final decisions are human-approved.
        </p>
      </div>
    </aside>
  );
};
