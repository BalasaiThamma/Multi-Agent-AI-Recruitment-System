import React, { useState, useEffect, useRef } from 'react';
import { Candidate, JobDescription } from './types';
import { api } from './services/api';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AgentActivityPanel } from './components/AgentActivityPanel';
import { DashboardTab } from './tabs/DashboardTab';
import { ResumeParserTab } from './tabs/ResumeParserTab';
import { SkillMatchingTab } from './tabs/SkillMatchingTab';
import { CodingAssessmentTab } from './tabs/CodingAssessmentTab';
import { ScreeningTab } from './tabs/ScreeningTab';
import { FairScoringTab } from './tabs/FairScoringTab';
import { CandidateReportTab } from './tabs/CandidateReportTab';
import { HRShortlistingTab } from './tabs/HRShortlistingTab';
import { CandidatePortal } from './candidate-portal/CandidatePortal';

export function App() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('CAND-001');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentRole, setCurrentRole] = useState<'recruiter' | 'candidate'>('recruiter');
  const [isActivityPanelOpen, setIsActivityPanelOpen] = useState(false);
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [agentEvents, setAgentEvents] = useState<any[]>([]);

  const wsRef = useRef<WebSocket | null>(null);

  // Initial Data Fetch
  const loadData = async () => {
    try {
      const cands = await api.getCandidates();
      setCandidates(cands);
      if (cands.length > 0 && !cands.find(c => c.id === selectedCandidateId)) {
        setSelectedCandidateId(cands[0].id);
      }
      const jobList = await api.getJobs();
      setJobs(jobList);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // WebSocket Live Stream Connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    const connectWs = () => {
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        console.log('Connected to Assessment Activity WebSocket');
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'WORKFLOW_STAGE_UPDATE') {
            setAgentEvents((prev) => [
              {
                id: `EV-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                stage: data.stage,
                message: data.message,
                status: data.status === 'Success' ? 'Success' : data.status === 'Failed' ? 'Failed' : 'Running',
                timestamp: new Date().toLocaleTimeString(),
              },
              ...prev.slice(0, 49),
            ]);

            if (data.stage === 'PipelineCompleted' || data.stage === 'PipelineFailed') {
              setIsPipelineRunning(false);
              loadData();
            }
          }
        } catch (e) {
          console.error('WS parse error:', e);
        }
      };

      socket.onclose = () => {
        setTimeout(connectWs, 3000);
      };
    };

    connectWs();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const addLogEvent = (stage: string, message: string, status: 'Running' | 'Success' | 'Failed') => {
    setAgentEvents((prev) => [
      {
        id: `EV-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        stage,
        message,
        status,
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev.slice(0, 49),
    ]);
  };

  const handleRunFullPipeline = async (candidateId?: string) => {
    const targetId = candidateId || selectedCandidateId;
    setIsPipelineRunning(true);
    setIsActivityPanelOpen(true);
    addLogEvent('Assessment Pipeline', `Triggering multi-stage assessment evaluation for candidate ${targetId}...`, 'Running');

    try {
      await api.runFullAssessment(targetId);
    } catch (err: any) {
      addLogEvent('Assessment Pipeline', `Assessment run encountered an error: ${err.message}`, 'Failed');
      setIsPipelineRunning(false);
    }
  };

  const handleResetDemoData = async () => {
    if (confirm('Reset candidate pool and job descriptions to initial state?')) {
      await api.resetDemoData();
      await loadData();
      addLogEvent('System', 'Candidate database refreshed successfully', 'Success');
    }
  };

  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId) || candidates[0] || {
    id: 'CAND-001',
    name: 'Alex Chen',
    role_applied: 'Senior Backend Engineer',
    status: 'Registered',
    resume_status: 'Pending',
    matching_status: 'Pending',
    coding_status: 'Pending',
    screening_status: 'Pending',
    fairness_status: 'Pending',
    approval_status: 'Pending',
    skill_match_score: 0,
    coding_score: 0,
    communication_score: 0,
    protocol_score: 0,
    overall_merit_score: 0
  };

  const candidateStats = {
    total: candidates.length,
    shortlisted: candidates.filter(c => c.status === 'Shortlisted').length,
    awaiting: candidates.filter(c => c.status === 'Awaiting Approval').length,
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* Sidebar Navigation - only shown in Recruiter mode */}
      {currentRole === 'recruiter' && (
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          candidateStats={candidateStats}
        />
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Top Header */}
        <Header
          candidates={candidates}
          selectedCandidateId={selectedCandidateId}
          onSelectCandidate={setSelectedCandidateId}
          onRunFullPipeline={() => handleRunFullPipeline(selectedCandidateId)}
          onResetDemoData={handleResetDemoData}
          isPipelineRunning={isPipelineRunning}
          currentRole={currentRole}
          onChangeRole={setCurrentRole}
          toggleActivityPanel={() => setIsActivityPanelOpen(!isActivityPanelOpen)}
          activityCount={agentEvents.length}
        />

        {/* Dynamic Body: Candidate Portal vs Recruiter Panel */}
        {currentRole === 'candidate' ? (
          <CandidatePortal
            candidates={candidates}
            selectedCandidate={selectedCandidate}
            jobs={jobs}
            onCandidateCreatedOrUpdated={loadData}
            onNavigateToRecruiter={() => setCurrentRole('recruiter')}
          />
        ) : (
          <main className="flex-1 overflow-y-auto p-8 bg-slate-950/90">
            <div className="max-w-7xl mx-auto pb-12">
              {activeTab === 'dashboard' && (
                <DashboardTab
                  candidates={candidates}
                  onSelectCandidate={(id) => {
                    setSelectedCandidateId(id);
                  }}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onRunFullPipeline={handleRunFullPipeline}
                />
              )}

              {activeTab === 'resume' && (
                <ResumeParserTab
                  candidate={selectedCandidate}
                  onRefreshCandidate={loadData}
                  onLogEvent={addLogEvent}
                />
              )}

              {activeTab === 'matching' && (
                <SkillMatchingTab
                  candidate={selectedCandidate}
                  jobs={jobs}
                  activeProvider="gemini"
                  onRefreshCandidate={loadData}
                  onLogEvent={addLogEvent}
                />
              )}

              {activeTab === 'coding' && (
                <CodingAssessmentTab
                  candidate={selectedCandidate}
                  onRefreshCandidate={loadData}
                  onLogEvent={addLogEvent}
                />
              )}

              {activeTab === 'screening' && (
                <ScreeningTab
                  candidate={selectedCandidate}
                  activeProvider="gemini"
                  onRefreshCandidate={loadData}
                  onLogEvent={addLogEvent}
                />
              )}

              {activeTab === 'scoring' && (
                <FairScoringTab
                  candidate={selectedCandidate}
                  onRefreshCandidate={loadData}
                  onLogEvent={addLogEvent}
                />
              )}

              {activeTab === 'report' && (
                <CandidateReportTab
                  candidate={selectedCandidate}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === 'hr' && (
                <HRShortlistingTab
                  candidates={candidates}
                  selectedCandidate={selectedCandidate}
                  onRefreshCandidate={loadData}
                  onLogEvent={addLogEvent}
                />
              )}
            </div>
          </main>
        )}
      </div>

      {/* Floating Real-Time Assessment Activity Drawer */}
      <AgentActivityPanel
        isOpen={isActivityPanelOpen}
        onClose={() => setIsActivityPanelOpen(false)}
        events={agentEvents}
        onClear={() => setAgentEvents([])}
      />
    </div>
  );
}

export default App;
